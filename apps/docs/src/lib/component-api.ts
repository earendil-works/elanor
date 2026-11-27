import {existsSync, readFileSync, realpathSync} from 'node:fs';
import {resolve} from 'node:path';

import ts from 'typescript';

import {pascalName} from './component-name.ts';

/** API reference for the public React components and functions, read from their TypeScript types. */

export interface ApiProp {
  readonly name: string;
  readonly type: string;
  readonly required: boolean;
  readonly defaultValue?: string | undefined;
  readonly description?: string | undefined;
}

export interface ApiPart {
  /** Public name, such as `Button` or `Modal.Root`. */
  readonly name: string;
  /** JSDoc on the component, if any. */
  readonly description?: string | undefined;
  /** Props declared by Elanor. Inherited props are summarized by `baseUi` and `element`. */
  readonly props: readonly ApiProp[];
  /** The Base UI part the props come from, if any. */
  readonly baseUi?: BaseUiLink | undefined;
  /** Default HTML element as inline Markdown, such as `` `<div>` ``. */
  readonly element?: string | undefined;
  /** Accepts React's HTML attributes, without a `baseUi` link that documents them. */
  readonly attributes: boolean;
  /** Accepts `ref`, without a `baseUi` link that documents it. */
  readonly ref: boolean;
  /** Accepts Base UI's `render` prop without a `baseUi` link that documents it. */
  readonly render: boolean;
}

export interface BaseUiLink {
  readonly name: string;
  readonly url: string;
}

/**
 * An exported function, such as `Composer.useActions`: Elanor's with its signature, or one
 * Base UI documents, such as `Popover.createHandle`.
 */
export type ApiFunction =
  | {
      readonly name: string;
      /** As TypeScript, such as `function useStatus(): ComposerStatus;`. */
      readonly signature: string;
      readonly description?: string | undefined;
    }
  | {readonly name: string; readonly baseUi: BaseUiLink};

/** An Elanor type that a function takes or returns. */
export interface ApiType {
  readonly name: string;
  /** The declaration with its JSDoc, as in the source. */
  readonly declaration: string;
}

export interface ComponentApi {
  readonly parts: readonly ApiPart[];
  readonly functions: readonly ApiFunction[];
  /** The types the functions use, and the types those use, in the order they come up. */
  readonly types: readonly ApiType[];
}

// Read through the docs package's dependency link, as in packages.ts.
const packageRoot = `${realpathSync(resolve(process.cwd(), 'node_modules/@earendil-works/elanor-react'))}/`;
const sourceRoot = `${packageRoot}src/`;
// Summarized by partSummary instead of listed in each table.
const omittedProps = new Set(['ref', 'className', 'style', 'key']);
const baseUiUtilities = new Set(['internals', 'utils', 'use-render', 'merge-props']);
const elements: Record<string, string> = {
  HTMLAnchorElement: 'a',
  HTMLButtonElement: 'button',
  HTMLDivElement: 'div',
  HTMLFormElement: 'form',
  HTMLHRElement: 'hr',
  HTMLInputElement: 'input',
  HTMLLIElement: 'li',
  HTMLParagraphElement: 'p',
  HTMLPreElement: 'pre',
  HTMLSpanElement: 'span',
  HTMLTableElement: 'table',
  HTMLTableRowElement: 'tr',
  HTMLTextAreaElement: 'textarea',
  HTMLUListElement: 'ul',
};

let cache: Map<string, ComponentApi> | undefined;
let baseUiRoot: string | undefined;

const noApi: ComponentApi = {parts: [], functions: [], types: []};

/** What the component directory `page`, such as `button`, exports. */
export function componentApi(page: string): ComponentApi {
  cache ??= readApi();
  return cache.get(page) ?? noApi;
}

function readApi(): Map<string, ComponentApi> {
  const config = ts.getParsedCommandLineOfConfigFile(`${packageRoot}tsconfig.json`, undefined, {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
      throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    },
  });
  if (!config) throw new Error('Cannot read the React package tsconfig.');
  const entry = `${sourceRoot}index.ts`;
  const program = ts.createProgram({rootNames: [entry], options: config.options});
  const checker = program.getTypeChecker();
  const baseUiFile = program
    .getSourceFiles()
    .find((file) => file.fileName.includes('/@base-ui/react/'));
  baseUiRoot = baseUiFile?.fileName.replace(/(\/@base-ui\/react\/).*$/, '$1');
  const index = program.getSourceFile(entry);
  const indexSymbol = index && checker.getSymbolAtLocation(index);
  if (!index || !indexSymbol) throw new Error(`Cannot read ${entry}.`);
  const publicTypes = new Set(
    checker
      .getExportsOfModule(indexSymbol)
      .map((symbol) => resolveAlias(checker, symbol))
      .filter((symbol) => symbol.flags & ts.SymbolFlags.Type),
  );

  const pages = new Map<string, {parts: ApiPart[]; functions: ApiFunction[]; uses: ts.Node[]}>();
  // Capitalized exports are components; other functions are hooks and helpers.
  const read = (page: string, name: string, exported: ts.Symbol) => {
    const entries = pages.get(page) ?? {parts: [], functions: [], uses: []};
    pages.set(page, entries);
    if (/^[A-Z]/.test(name.split('.').at(-1) ?? '')) {
      const part = readPart(checker, name, exported);
      if (part) entries.parts.push(part);
      return;
    }
    const found = readFunction(checker, name, resolveAlias(checker, exported));
    if (!found) return;
    entries.functions.push(found.api);
    if (found.node) entries.uses.push(found.node);
  };
  for (const statement of index.statements) {
    if (!ts.isExportDeclaration(statement) || statement.isTypeOnly) continue;
    const specifier = statement.moduleSpecifier;
    if (!specifier || !ts.isStringLiteral(specifier) || !specifier.text.startsWith('./')) continue;
    const page = specifier.text.split('/')[1];
    const clause = statement.exportClause;
    if (!page || !clause) continue;

    if (ts.isNamespaceExport(clause)) {
      const namespace = checker.getSymbolAtLocation(clause.name);
      const module = namespace && resolveAlias(checker, namespace);
      if (!module) continue;
      for (const member of checker.getExportsOfModule(module)) {
        read(page, `${clause.name.text}.${member.name}`, member);
      }
    } else {
      for (const element of clause.elements) {
        if (element.isTypeOnly) continue;
        const symbol = checker.getSymbolAtLocation(element.name);
        if (symbol) read(page, element.name.text, symbol);
      }
    }
  }
  return new Map(
    [...pages].map(([page, {parts, functions, uses}]) => [
      page,
      {parts, functions, types: usedTypes(checker, uses, publicTypes)},
    ]),
  );
}

/**
 * A function's API, and the declaration whose types it exposes when Elanor writes one: a function
 * declaration or an arrow function in a constant. A function re-exported from Base UI, such as
 * `createHandle`, links to Base UI's documentation; any other shows the signature TypeScript
 * infers.
 */
function readFunction(
  checker: ts.TypeChecker,
  name: string,
  symbol: ts.Symbol,
): {readonly api: ApiFunction; readonly node: ts.SignatureDeclaration | undefined} | undefined {
  const declaration = symbol.valueDeclaration;
  if (!declaration) return;
  const call = checker.getTypeOfSymbolAtLocation(symbol, declaration).getCallSignatures()[0];
  if (!call) return;
  const initializer = ts.isVariableDeclaration(declaration) ? declaration.initializer : undefined;
  const node =
    ts.isFunctionDeclaration(declaration) && declaration.body
      ? declaration
      : initializer && (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer))
        ? initializer
        : undefined;
  const shortName = name.split('.').at(-1) ?? name;
  const reference = !node && initializer ? baseUiReference(checker, initializer) : undefined;
  const baseUi = reference && baseUiLink(reference.link.split('/')[0] ?? '', shortName);
  if (baseUi) return {api: {name, baseUi}, node: undefined};
  const text = (item: ts.Node) => item.getText().replace(/\s+/g, ' ');
  const typeParameters = node?.typeParameters
    ? `<${node.typeParameters.map(text).join(', ')}>`
    : '';
  const parameters = node?.parameters.map(text);
  const returns = node?.type
    ? text(node.type)
    : checker.typeToString(call.getReturnType(), declaration, typeFlags);
  const head = `function ${shortName}${typeParameters}`;
  const oneLine = parameters
    ? `${head}(${parameters.join(', ')}): ${returns};`
    : `${head}${checker.signatureToString(call, declaration, typeFlags)};`;
  const signature =
    oneLine.length <= 80 || !parameters?.length
      ? oneLine
      : `${head}(\n${parameters.map((parameter) => `  ${parameter},\n`).join('')}): ${returns};`;
  return {
    api: {
      name,
      signature,
      description: isOwn(declaration) ? jsDocText(declaration) : undefined,
    },
    node,
  };
}

/**
 * Elanor's public types that `nodes` name, then the ones those name, in the order they come up,
 * such as `ComposerActions` and then the `ComposerInsertOptions` of its `insert`.
 */
function usedTypes(
  checker: ts.TypeChecker,
  nodes: readonly ts.Node[],
  publicTypes: ReadonlySet<ts.Symbol>,
): ApiType[] {
  const found: ts.Symbol[] = [];
  const visit = (node: ts.Node): void => {
    // A function's body names types it doesn't expose.
    if (ts.isBlock(node)) return;
    const name = ts.isTypeReferenceNode(node)
      ? node.typeName
      : ts.isExpressionWithTypeArguments(node)
        ? node.expression
        : undefined;
    const reference = name && checker.getSymbolAtLocation(name);
    const symbol = reference && resolveAlias(checker, reference);
    if (symbol && publicTypes.has(symbol) && !found.includes(symbol)) {
      const declarations = (symbol.declarations ?? []).filter(isOwn);
      if (declarations.length > 0) {
        found.push(symbol);
        declarations.forEach(visit);
      }
    }
    ts.forEachChild(node, visit);
  };
  nodes.forEach(visit);
  return found.map((symbol) => ({
    name: symbol.name,
    declaration: (symbol.declarations ?? [])
      .filter(isOwn)
      .map((node) =>
        [...ts.getJSDocCommentsAndTags(node).filter(ts.isJSDoc), node]
          .map((item) => item.getText())
          .join('\n')
          .replace(/^export /m, ''),
      )
      .join('\n'),
  }));
}

function resolveAlias(checker: ts.TypeChecker, symbol: ts.Symbol): ts.Symbol {
  return symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
}

const isOwn = (node: ts.Node) => node.getSourceFile().fileName.startsWith(sourceRoot);

function readPart(checker: ts.TypeChecker, name: string, exported: ts.Symbol): ApiPart | undefined {
  const symbol = resolveAlias(checker, exported);
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
  if (!declaration) return;
  const signature = checker.getTypeOfSymbolAtLocation(symbol, declaration).getCallSignatures()[0];
  const parameter = signature?.getParameters()[0];
  if (!parameter) return;
  const propsType = checker.getTypeOfSymbolAtLocation(parameter, declaration);
  const implementation = ts.isFunctionDeclaration(declaration) ? declaration : undefined;
  const defaults = destructuredDefaults(implementation);

  const props: ApiProp[] = [];
  const baseUiParts = new Map<string, number>();
  let element: string | undefined;
  let ref = false;
  let attributes = false;
  for (const prop of propsType.getProperties()) {
    const declarations = prop.declarations ?? [];
    if (prop.name === 'ref') {
      ref = true;
      element = refElement(checker, prop);
    }
    attributes ||= declarations.some(isHtmlAttribute);
    if (omittedProps.has(prop.name)) continue;
    const own = declarations.find(isOwn);
    if (own) {
      props.push(readProp(checker, prop, own, defaults.get(prop.name)));
      continue;
    }
    // List inherited props only when Elanor changes their default.
    const elanorDefault = defaults.get(prop.name);
    const [inherited] = declarations;
    if (elanorDefault && inherited && changesDefault(inherited, elanorDefault.getText())) {
      props.push(readProp(checker, prop, inherited, elanorDefault));
    }
    for (const node of declarations) {
      const key = baseUiLocation(node);
      if (key) baseUiParts.set(key, (baseUiParts.get(key) ?? 0) + 1);
    }
  }

  const fileImports = baseUiImports(declaration.getSourceFile());
  const [mostCommon] = [...baseUiParts].sort((a, b) => b[1] - a[1]);
  // Link to the Base UI part as Elanor's code names it: the part a constant re-exports, or else
  // the part a component renders, through the Elanor components it renders; of those, the one its
  // props come from, if they come from one; otherwise the part most of its props come from. So
  // SearchDialog.Status links to Autocomplete.Status, which Base UI declares as Combobox.Status,
  // and Menu.Separator to Separator.
  const references = baseUiReferences(checker, declaration);
  const reference =
    ts.isVariableDeclaration(declaration) || !mostCommon
      ? references[0]
      : references.find((item) => item.declared === mostCommon[0]);
  const linked = reference && (hasSection(reference.link) ? reference.link : reference.declared);
  const baseUiSource = (linked ?? mostCommon?.[0])?.split('/');
  const component = baseUiSource?.[0] ?? fileImports.find((module) => baseUiLink(module));
  // Parts typed only with Base UI's shared props still match a same-named Base UI part, unless
  // the name is the component's own, which its whole page documents.
  const sameName = kebabName(name.split('.').at(-1) ?? '');
  const baseUiPart =
    baseUiSource?.[1] ??
    (component && sameName !== component && hasSection(`${component}/${sameName}`)
      ? sameName
      : undefined);
  const declaredInBaseUi = /@base-ui\/react\//.test(declaration.getSourceFile().fileName);
  const usesBaseUi = declaredInBaseUi || baseUiParts.size > 0 || hasBaseUiProps(propsType);
  const baseUi =
    usesBaseUi && component
      ? baseUiLink(component, baseUiPart && pascalName(baseUiPart))
      : undefined;

  return {
    name,
    description: isOwn(declaration) ? jsDocText(declaration) : undefined,
    props,
    baseUi,
    element: jsxElement(implementation) ?? element,
    attributes: !baseUi && attributes,
    ref: !baseUi && ref,
    render: !baseUi && hasBaseUiRender(propsType),
  };
}

/** True for a prop React declares for every element, such as `id` or `onClick`. */
const isHtmlAttribute = (node: ts.Node) =>
  /\/@types\/react\//.test(node.getSourceFile().fileName) &&
  ts.isInterfaceDeclaration(node.parent) &&
  /^(?:DOM|Aria|HTML)Attributes$/.test(node.parent.name.text);

/** The Base UI component, and part if any, that declares `node`, such as `menu/root`. */
function baseUiLocation(node: ts.Node): string | undefined {
  const match = /@base-ui\/react\/(?:esm\/)?([\w-]+)\/(?:([\w-]+)\/)?[\w.-]+$/.exec(
    node.getSourceFile().fileName,
  );
  if (!match?.[1] || baseUiUtilities.has(match[1])) return;
  return match[2] ? `${match[1]}/${match[2]}` : match[1];
}

/** True when props include Base UI's `render` prop, not an unrelated prop of that name. */
function hasBaseUiRender(type: ts.Type): boolean {
  return (type.getProperty('render')?.declarations ?? []).some((node) =>
    /@base-ui\/react\//.test(node.getSourceFile().fileName),
  );
}

/** True when props include Base UI's generic component props, such as `render`. */
function hasBaseUiProps(type: ts.Type): boolean {
  return type
    .getProperties()
    .some((prop) =>
      prop.declarations?.some((node) =>
        /@base-ui\/react\/(?:esm\/)?(?:internals|utils)\//.test(node.getSourceFile().fileName),
      ),
    );
}

function baseUiImports(file: ts.SourceFile): string[] {
  return file.statements.flatMap((statement) =>
    ts.isImportDeclaration(statement) &&
    ts.isStringLiteral(statement.moduleSpecifier) &&
    statement.moduleSpecifier.text.startsWith('@base-ui/react/')
      ? [statement.moduleSpecifier.text.slice('@base-ui/react/'.length)]
      : [],
  );
}

function readProp(
  checker: ts.TypeChecker,
  prop: ts.Symbol,
  declaration: ts.Declaration,
  destructured: ts.Expression | undefined,
): ApiProp {
  // Read docs from the given declaration only; intersections would merge Elanor's and Base UI's.
  // Inherited docs can be long, so keep their first sentence.
  const docs = jsDocText(declaration);
  const description = isOwn(declaration) ? docs : docs?.replace(/(?<=\.)\s[\s\S]*$/, '');
  const tag = ts.getJSDocTags(declaration).find((item) => item.tagName.text === 'default');
  const tagged = tag && ts.getTextOfJSDocComment(tag.comment);
  // An inherited tag names the default Elanor replaces.
  const defaultValue = destructured
    ? (defaultText(checker, destructured) ?? (isOwn(declaration) ? tagged : undefined))
    : tagged;
  return {
    name: prop.name,
    type: formatType(checker, checker.getTypeOfSymbol(prop), declaration),
    required: !(prop.flags & ts.SymbolFlags.Optional),
    defaultValue,
    description,
  };
}

/**
 * A destructured default as you'd write it, rather than the name of a constant in the
 * implementation: the constant's value, `<a />` for a render function that returns an `<a>`, or
 * nothing for a function with nothing to show, such as one that returns `''`.
 */
function defaultText(checker: ts.TypeChecker, initializer: ts.Expression): string | undefined {
  if (!ts.isIdentifier(initializer)) return initializer.getText();
  const symbol = checker.getSymbolAtLocation(initializer);
  const declaration = symbol && resolveAlias(checker, symbol).valueDeclaration;
  const value =
    declaration && ts.isVariableDeclaration(declaration) ? declaration.initializer : undefined;
  if (!value) return;
  if (ts.isArrowFunction(value) || ts.isFunctionExpression(value)) {
    const tag = ts.isBlock(value.body) ? undefined : outermostTag(value.body);
    const element = tag && lowercase(tag.getText());
    return element && `<${element} />`;
  }
  return defaultText(checker, value);
}

function changesDefault(inherited: ts.Declaration, elanorDefault: string): boolean {
  const normalize = (value: string) => value.trim().replaceAll('"', "'");
  const tag = ts.getJSDocTags(inherited).find((item) => item.tagName.text === 'default');
  const upstream = tag && ts.getTextOfJSDocComment(tag.comment);
  if (upstream) return normalize(upstream) !== normalize(elanorDefault);
  return !['false', 'null', 'undefined'].includes(elanorDefault);
}

function jsDocText(node: ts.Node): string | undefined {
  const text = ts
    .getJSDocCommentsAndTags(node)
    .filter(ts.isJSDoc)
    .map((doc) => ts.getTextOfJSDocComment(doc.comment) ?? '')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text || undefined;
}

const typeFlags =
  ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseSingleQuotesForStringLiteralType;

/**
 * Expands Elanor's own aliases, such as `ButtonHierarchy`, into their values.
 * Keeps library names, such as `ReactNode`, as written.
 */
function formatType(checker: ts.TypeChecker, type: ts.Type, declaration: ts.Declaration): string {
  const nonNullable = checker.getNonNullableType(type);
  const node =
    ts.isPropertySignature(declaration) || ts.isPropertyDeclaration(declaration)
      ? declaration.type
      : undefined;
  const reference =
    node && ts.isTypeReferenceNode(node) ? checker.getSymbolAtLocation(node.typeName) : undefined;
  const ownAlias = reference && resolveAlias(checker, reference).declarations?.some(isOwn);
  const literals =
    ownAlias && reference ? literalUnion(resolveAlias(checker, reference)) : undefined;
  if (literals) return literals;
  const computed = node && (ts.isIndexedAccessTypeNode(node) || ts.isTypeQueryNode(node));
  if (nonNullable.isUnion() && (!node || ownAlias || computed)) {
    return formatUnion(checker, nonNullable.types);
  }
  if (node) {
    return node
      .getText()
      .replace(/\s*\|\s*undefined\b/g, '')
      .replace(/\s+/g, ' ')
      .replaceAll('"', "'");
  }
  return checker.typeToString(nonNullable, undefined, typeFlags);
}

/** Values of an alias such as `type Gap = 'small' | 'medium'`, in source order. */
function literalUnion(alias: ts.Symbol): string | undefined {
  const declaration = alias.declarations?.find(ts.isTypeAliasDeclaration);
  const node = declaration?.type;
  if (!node || !ts.isUnionTypeNode(node) || !node.types.every(ts.isLiteralTypeNode)) return;
  const texts = node.types.map((type) => type.getText().replaceAll('"', "'"));
  const numbers = texts.map(Number);
  const sequential =
    numbers.length >= 4 &&
    numbers.every((value, index) => index === 0 || value === (numbers[index - 1] ?? 0) + 1);
  return sequential ? `${texts[0]} | … | ${texts.at(-1)}` : texts.join(' | ');
}

function formatUnion(checker: ts.TypeChecker, members: readonly ts.Type[]): string {
  const numbers = members
    .filter((member) => member.isNumberLiteral())
    .map((member) => member.value);
  const others = members.filter((member) => !member.isNumberLiteral());
  const hasTrue = others.some((member) => checker.typeToString(member) === 'true');
  const hasFalse = others.some((member) => checker.typeToString(member) === 'false');
  const texts = others
    .filter((member) => !(hasTrue && hasFalse && member.flags & ts.TypeFlags.BooleanLiteral))
    .map((member) => checker.typeToString(member, undefined, typeFlags));
  if (hasTrue && hasFalse) texts.unshift('boolean');
  const sequential =
    numbers.length >= 4 &&
    numbers.every((value, index) => index === 0 || value === (numbers[index - 1] ?? 0) + 1);
  const numberTexts = sequential ? [`${numbers[0]} | … | ${numbers.at(-1)}`] : numbers.map(String);
  return [...numberTexts, ...texts].join(' | ');
}

function destructuredDefaults(
  implementation: ts.FunctionDeclaration | undefined,
): Map<string, ts.Expression> {
  const defaults = new Map<string, ts.Expression>();
  const pattern = implementation?.parameters[0]?.name;
  if (!pattern || !ts.isObjectBindingPattern(pattern)) return defaults;
  for (const element of pattern.elements) {
    const key = element.propertyName ?? element.name;
    if (element.initializer && (ts.isIdentifier(key) || ts.isStringLiteral(key))) {
      defaults.set(key.text, element.initializer);
    }
  }
  return defaults;
}

function refElement(checker: ts.TypeChecker, prop: ts.Symbol): string | undefined {
  const text = checker.typeToString(checker.getTypeOfSymbol(prop), undefined, typeFlags);
  const match = /\b(HTML\w+Element)\b/.exec(text);
  if (match?.[1] === 'HTMLHeadingElement') return '`<h1>`–`<h6>`';
  const element = match?.[1] && elements[match[1]];
  return element && `\`<${element}>\``;
}

/** The element a function component renders: its outermost lowercase JSX tag or `useRender`'s `defaultTagName`. */
function jsxElement(implementation: ts.FunctionDeclaration | undefined): string | undefined {
  if (!implementation) return;
  for (const node of ownNodes(implementation)) {
    if (
      ts.isPropertyAssignment(node) &&
      node.name.getText() === 'defaultTagName' &&
      ts.isStringLiteral(node.initializer)
    ) {
      return `\`<${node.initializer.text}>\``;
    }
    const tag =
      ts.isReturnStatement(node) && node.expression ? outermostTag(node.expression) : undefined;
    const element = tag && lowercase(tag.getText());
    if (element) return `\`<${element}>\``;
  }
}

interface BaseUiReference {
  /** The part as Elanor imports it, such as `autocomplete/status`. */
  readonly link: string;
  /** The part that declares it, as in `baseUiLocation`, such as `combobox/status`. */
  readonly declared: string | undefined;
}

/**
 * The Base UI parts a part is built from, as Elanor's code names them: the one a constant
 * re-exports, or the JSX elements a function component renders, in source order and through the
 * Elanor components it renders.
 */
function baseUiReferences(checker: ts.TypeChecker, declaration: ts.Declaration): BaseUiReference[] {
  if (ts.isVariableDeclaration(declaration)) {
    const reference = declaration.initializer && baseUiReference(checker, declaration.initializer);
    return reference ? [reference] : [];
  }
  if (!ts.isFunctionDeclaration(declaration)) return [];
  return ownNodes(declaration).flatMap((node) => {
    if (!ts.isJsxSelfClosingElement(node) && !ts.isJsxOpeningElement(node)) return [];
    const {tagName} = node;
    const reference = baseUiReference(checker, tagName);
    if (reference) return [reference];
    const symbol = checker.getSymbolAtLocation(
      ts.isPropertyAccessExpression(tagName) ? tagName.name : tagName,
    );
    const component = symbol && resolveAlias(checker, symbol).valueDeclaration;
    return component &&
      isOwn(component) &&
      (ts.isFunctionDeclaration(component) || ts.isVariableDeclaration(component))
      ? baseUiReferences(checker, component)
      : [];
  });
}

/** `BaseAutocomplete.Status`, or `BaseSeparator`, as a part of the Base UI module it's imported from. */
function baseUiReference(
  checker: ts.TypeChecker,
  expression: ts.Node,
): BaseUiReference | undefined {
  const [namespace, member] = ts.isPropertyAccessExpression(expression)
    ? [expression.expression, expression.name]
    : [expression, undefined];
  if (!ts.isIdentifier(namespace)) return;
  const [imported] = checker.getSymbolAtLocation(namespace)?.declarations ?? [];
  const specifier = imported && ts.findAncestor(imported, ts.isImportDeclaration)?.moduleSpecifier;
  const module =
    specifier && ts.isStringLiteral(specifier)
      ? /^@base-ui\/react\/([\w-]+)$/.exec(specifier.text)?.[1]
      : undefined;
  if (!module || baseUiUtilities.has(module)) return;
  const symbol = checker.getSymbolAtLocation(member ?? namespace);
  const declaration = symbol && resolveAlias(checker, symbol).valueDeclaration;
  return {
    link: member ? `${module}/${kebabName(member.text)}` : module,
    declared: declaration && baseUiLocation(declaration),
  };
}

/** Whether Base UI's documentation has the page, and section if any, of `location`, such as `autocomplete/status`. */
function hasSection(location: string): boolean {
  const [component, part] = location.split('/');
  const page = component ? baseUiPage(component) : undefined;
  return page !== undefined && (!part || page.includes(`\n### ${pascalName(part)}\n`));
}

/**
 * The link to Base UI's documentation of `component`, such as `menu`, and of its `section`, such
 * as `Positioner` or `createHandle`. A component without a page of its own, such as
 * `radio-group`, links to its section of the page it's named after, `radio`.
 */
function baseUiLink(component: string, section?: string): BaseUiLink | undefined {
  const parent = component.replace(/-[a-z]+$/, '');
  const page =
    baseUiPage(component) !== undefined
      ? component
      : baseUiPage(parent)?.includes(`\n### ${pascalName(component)}\n`)
        ? parent
        : undefined;
  if (!page) return;
  const anchor = page === component ? section : pascalName(component);
  return {
    name: [pascalName(component), section].filter(Boolean).join('.'),
    url: `https://base-ui.com/react/components/${page}${anchor ? `#${anchor.toLowerCase()}` : ''}`,
  };
}

const baseUiPages = new Map<string, string | undefined>();

/** Base UI's Markdown documentation of `component`, such as `menu`, if it has a page. */
function baseUiPage(component: string): string | undefined {
  if (!baseUiPages.has(component)) {
    const file = `${baseUiRoot}docs/react/components/${component}.md`;
    baseUiPages.set(component, existsSync(file) ? readFileSync(file, 'utf8') : undefined);
  }
  return baseUiPages.get(component);
}

const kebabName = (name: string) => name.replace(/(?<!^)[A-Z]/g, '-$&').toLowerCase();

/** A function's nodes in source order, without the bodies of functions nested in it. */
function ownNodes(implementation: ts.FunctionDeclaration): ts.Node[] {
  const nodes: ts.Node[] = [];
  const visit = (node: ts.Node): void => {
    nodes.push(node);
    if (!ts.isFunctionLike(node) || node === implementation) ts.forEachChild(node, visit);
  };
  visit(implementation);
  return nodes;
}

/** The outermost JSX tag of an expression, looking through context providers and fragments. */
function outermostTag(node: ts.Node): ts.JsxTagNameExpression | undefined {
  while (ts.isParenthesizedExpression(node)) node = node.expression;
  if (ts.isJsxSelfClosingElement(node)) return node.tagName;
  if (
    ts.isJsxElement(node) &&
    !/(?:^|\.)(?:Provider|Fragment)$/.test(node.openingElement.tagName.getText())
  ) {
    return node.openingElement.tagName;
  }
  if (!ts.isJsxElement(node) && !ts.isJsxFragment(node)) return;
  const child = node.children.find(
    (item) => ts.isJsxElement(item) || ts.isJsxSelfClosingElement(item),
  );
  return child && outermostTag(child);
}

const lowercase = (tag: string) => (/^[a-z][\w-]*$/.test(tag) ? tag : undefined);

/**
 * The API in the order the page body first mentions it: parts as JSX, such as `<Composer.Root`,
 * and functions by name, such as `Composer.useActions`. Unmentioned ones follow.
 */
export function orderedApi(page: string, body: string): ComponentApi {
  const api = componentApi(page);
  const ordered = <Item extends {readonly name: string}>(
    items: readonly Item[],
    prefix: string,
  ) => {
    const position = (item: Item) => {
      const index = body.search(new RegExp(`${prefix}${item.name.replace('.', '\\.')}\\b`));
      return index === -1 ? Number.POSITIVE_INFINITY : index;
    };
    return items
      .map((item, index) => ({item, index}))
      .sort((a, b) => position(a.item) - position(b.item) || a.index - b.index)
      .map(({item}) => item);
  };
  return {...api, parts: ordered(api.parts, '<'), functions: ordered(api.functions, '')};
}

/** The sentence, in Markdown, for a function Elanor re-exports from Base UI. */
export const functionSummary = (link: BaseUiLink): string =>
  `Re-exports Base UI's [\`${link.name}\`](${link.url}).`;

/** The page's types as one block of TypeScript. */
export const typeDeclarations = (api: ComponentApi): string =>
  api.types.map((type) => type.declaration).join('\n\n');

/**
 * One sentence, in Markdown, describing what a part renders and accepts beyond its own props, if
 * anything: a part that renders no element, such as `Composer.Root`, gets none.
 */
export function partSummary(part: ApiPart): string | undefined {
  const verb = part.props.length ? 'Also accepts' : 'Accepts';
  if (part.baseUi) return `${verb} Base UI [\`${part.baseUi.name}\`](${part.baseUi.url}) props.`;
  const extras = [
    ...(part.attributes ? ['HTML attributes'] : []),
    ...(part.ref ? ['`ref`'] : []),
    ...(part.render ? ['`render`'] : []),
  ];
  const accepts =
    extras.length < 3
      ? extras.join(' and ')
      : `${extras.slice(0, -1).join(', ')}, and ${extras.at(-1)}`;
  const sentences = [
    part.element && `Renders ${part.element}.`,
    accepts && `${verb}${part.element ? ' its' : ''} ${accepts}.`,
  ].filter(Boolean);
  return sentences.length ? sentences.join(' ') : undefined;
}
