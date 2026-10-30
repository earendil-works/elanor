import {existsSync, realpathSync} from 'node:fs';
import {resolve} from 'node:path';

import ts from 'typescript';

/** Props reference for the public React components, read from their TypeScript types. */

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
  readonly baseUi?: {readonly name: string; readonly url: string} | undefined;
  /** Default HTML element as inline Markdown, such as `` `<div>` ``. */
  readonly element?: string | undefined;
  /** Accepts Base UI's `render` prop without a `baseUi` link that documents it. */
  readonly render: boolean;
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

let cache: Map<string, ApiPart[]> | undefined;
let baseUiRoot: string | undefined;

/** Parts exported from the component directory `page`, such as `button`. */
export function componentApi(page: string): ApiPart[] {
  cache ??= readApi();
  return cache.get(page) ?? [];
}

function readApi(): Map<string, ApiPart[]> {
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
  if (!index) throw new Error(`Cannot read ${entry}.`);

  const pages = new Map<string, ApiPart[]>();
  for (const statement of index.statements) {
    if (!ts.isExportDeclaration(statement) || statement.isTypeOnly) continue;
    const specifier = statement.moduleSpecifier;
    if (!specifier || !ts.isStringLiteral(specifier) || !specifier.text.startsWith('./')) continue;
    const page = specifier.text.split('/')[1];
    const clause = statement.exportClause;
    if (!page || !clause) continue;
    const parts = pages.get(page) ?? [];
    pages.set(page, parts);

    if (ts.isNamespaceExport(clause)) {
      const namespace = checker.getSymbolAtLocation(clause.name);
      const module = namespace && resolveAlias(checker, namespace);
      if (!module) continue;
      for (const member of checker.getExportsOfModule(module)) {
        const part = readPart(checker, `${clause.name.text}.${member.name}`, member);
        if (part) parts.push(part);
      }
    } else {
      for (const element of clause.elements) {
        if (element.isTypeOnly) continue;
        const symbol = checker.getSymbolAtLocation(element.name);
        const part = symbol && readPart(checker, element.name.text, symbol);
        if (part) parts.push(part);
      }
    }
  }
  return pages;
}

function resolveAlias(checker: ts.TypeChecker, symbol: ts.Symbol): ts.Symbol {
  return symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
}

const isOwn = (node: ts.Node) => node.getSourceFile().fileName.startsWith(sourceRoot);

function readPart(checker: ts.TypeChecker, name: string, exported: ts.Symbol): ApiPart | undefined {
  if (!/^[A-Z]/.test(name.split('.').pop() ?? '')) return;
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
  for (const prop of propsType.getProperties()) {
    const declarations = prop.declarations ?? [];
    if (prop.name === 'ref') element = refElement(checker, prop);
    if (omittedProps.has(prop.name)) continue;
    const own = declarations.find(isOwn);
    if (own) {
      props.push(readProp(checker, prop, own, defaults.get(prop.name)));
      continue;
    }
    // List inherited props only when Elanor changes their default.
    const elanorDefault = defaults.get(prop.name);
    const [inherited] = declarations;
    if (elanorDefault && inherited && changesDefault(inherited, elanorDefault)) {
      props.push(readProp(checker, prop, inherited, elanorDefault));
    }
    for (const node of declarations) {
      const match = /@base-ui\/react\/(?:esm\/)?([\w-]+)\/(?:([\w-]+)\/)?[\w.-]+$/.exec(
        node.getSourceFile().fileName,
      );
      if (!match?.[1] || baseUiUtilities.has(match[1])) continue;
      const key = match[2] ? `${match[1]}/${match[2]}` : match[1];
      baseUiParts.set(key, (baseUiParts.get(key) ?? 0) + 1);
    }
  }

  const fileImports = baseUiImports(declaration.getSourceFile());
  const [mostCommon] = [...baseUiParts].sort((a, b) => b[1] - a[1]);
  const baseUiFromProps = mostCommon?.[0].split('/');
  const component =
    baseUiFromProps?.[0] ?? fileImports.find((module) => !baseUiUtilities.has(module));
  // Parts typed only with Base UI's shared props still match a same-named Base UI part.
  const sameName = (name.split('.').at(-1) ?? '').replace(/(?<!^)[A-Z]/g, '-$&').toLowerCase();
  const baseUiPart =
    baseUiFromProps?.[1] ??
    (component && baseUiRoot && existsSync(`${baseUiRoot}${component}/${sameName}`)
      ? sameName
      : undefined);
  const declaredInBaseUi = /@base-ui\/react\//.test(declaration.getSourceFile().fileName);
  const usesBaseUi = declaredInBaseUi || baseUiParts.size > 0 || hasBaseUiProps(propsType);

  const baseUi =
    usesBaseUi && component
      ? {
          name: [pascal(component), baseUiPart && pascal(baseUiPart)].filter(Boolean).join('.'),
          url: `https://base-ui.com/react/components/${component}${baseUiPart ? `#${baseUiPart.replaceAll('-', '')}` : ''}`,
        }
      : undefined;

  return {
    name,
    description: isOwn(declaration) ? jsDocText(declaration) : undefined,
    props,
    baseUi,
    element: jsxElement(implementation) ?? element,
    render: !baseUi && hasBaseUiRender(propsType),
  };
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
  destructured: string | undefined,
): ApiProp {
  // Read docs from the given declaration only; intersections would merge Elanor's and Base UI's.
  // Inherited docs can be long, so keep their first sentence.
  const docs = jsDocText(declaration);
  const description = isOwn(declaration) ? docs : docs?.replace(/(?<=\.)\s[\s\S]*$/, '');
  const tagged = ts.getJSDocTags(declaration).find((tag) => tag.tagName.text === 'default');
  return {
    name: prop.name,
    type: formatType(checker, checker.getTypeOfSymbol(prop), declaration),
    required: !(prop.flags & ts.SymbolFlags.Optional),
    defaultValue: destructured ?? (tagged && ts.getTextOfJSDocComment(tagged.comment)),
    description,
  };
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
): Map<string, string> {
  const defaults = new Map<string, string>();
  const pattern = implementation?.parameters[0]?.name;
  if (!pattern || !ts.isObjectBindingPattern(pattern)) return defaults;
  for (const element of pattern.elements) {
    const key = element.propertyName ?? element.name;
    if (element.initializer && (ts.isIdentifier(key) || ts.isStringLiteral(key))) {
      defaults.set(key.text, element.initializer.getText());
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
  let found: string | undefined;
  const outermost = (node: ts.Node): string | undefined => {
    while (ts.isParenthesizedExpression(node)) node = node.expression;
    if (ts.isJsxSelfClosingElement(node)) return lowercase(node.tagName.getText());
    if (!ts.isJsxElement(node) && !ts.isJsxFragment(node)) return;
    // Look through context providers and fragments to the first element they render.
    const tag = ts.isJsxElement(node) ? node.openingElement.tagName.getText() : 'Fragment';
    if (!/(?:^|\.)(?:Provider|Fragment)$/.test(tag)) return lowercase(tag);
    const child = node.children.find(
      (item) => ts.isJsxElement(item) || ts.isJsxSelfClosingElement(item),
    );
    return child && outermost(child);
  };
  const visit = (node: ts.Node): void => {
    if (found) return;
    if (
      ts.isPropertyAssignment(node) &&
      node.name.getText() === 'defaultTagName' &&
      ts.isStringLiteral(node.initializer)
    ) {
      found = node.initializer.text;
      return;
    }
    if (ts.isReturnStatement(node) && node.expression) {
      found = outermost(node.expression);
      if (found) return;
    }
    if (ts.isFunctionLike(node) && node !== implementation) return;
    ts.forEachChild(node, visit);
  };
  if (implementation) visit(implementation);
  return found && `\`<${found}>\``;
}

const lowercase = (tag: string) => (/^[a-z][\w-]*$/.test(tag) ? tag : undefined);

const pascal = (value: string) =>
  value.replace(/(^|-)(\w)/g, (_, __, letter: string) => letter.toUpperCase());

/** Parts in the order the page body first mentions them; unmentioned parts follow. */
export function orderedApi(page: string, body: string): ApiPart[] {
  const position = (part: ApiPart) => {
    const index = body.search(new RegExp(`<${part.name.replace('.', '\\.')}\\b`));
    return index === -1 ? Number.POSITIVE_INFINITY : index;
  };
  return componentApi(page)
    .map((part, index) => ({part, index}))
    .sort((a, b) => position(a.part) - position(b.part) || a.index - b.index)
    .map(({part}) => part);
}

/** One sentence, in Markdown, describing what a part renders and accepts beyond its own props. */
export function partSummary(part: ApiPart): string {
  const verb = part.props.length ? 'Also accepts' : 'Accepts';
  if (part.baseUi) return `${verb} Base UI [\`${part.baseUi.name}\`](${part.baseUi.url}) props.`;
  const extras = part.render ? 'HTML attributes, `ref`, and `render`' : 'HTML attributes and `ref`';
  if (part.element) return `Renders ${part.element}. ${verb} its ${extras}.`;
  return `${verb} ${extras}.`;
}
