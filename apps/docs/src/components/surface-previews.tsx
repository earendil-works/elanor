import type {ComponentProps} from 'react';
import {AppLayoutExample} from '../../../../packages/react/src/app-layout/app-layout.example.tsx';
import {ButtonExample} from '../../../../packages/react/src/button/button.example.tsx';
import {CardContentExample, CardSummaryExample} from '../../../../packages/react/src/card/card.example.tsx';
import {CheckboxExample} from '../../../../packages/react/src/checkbox/checkbox.example.tsx';
import {CodeSnippetCopyExample, CodeSnippetExample} from '../../../../packages/react/src/code-snippet/code-snippet.example.tsx';
import {ControlAndLabelExample} from '../../../../packages/react/src/control-and-label/control-and-label.example.tsx';
import {CopyButtonExample} from '../../../../packages/react/src/copy-button/copy-button.example.tsx';
import {DropdownExample, DropdownMultipleExample, DropdownRadioExample} from '../../../../packages/react/src/dropdown/dropdown.example.tsx';
import {SearchableDropdownExample} from '../../../../packages/react/src/dropdown/searchable-dropdown.example.tsx';
import {EmptyStateExample} from '../../../../packages/react/src/empty-state/empty-state.example.tsx';
import {FieldExample} from '../../../../packages/react/src/field/field.example.tsx';
import {HeadingExample} from '../../../../packages/react/src/heading/heading.example.tsx';
import {IconButtonExample} from '../../../../packages/react/src/icon-button/icon-button.example.tsx';
import {InputExample} from '../../../../packages/react/src/input/input.example.tsx';
import {KeyValueExample} from '../../../../packages/react/src/key-value/key-value.example.tsx';
import {LinkExample} from '../../../../packages/react/src/link/link.example.tsx';
import {MenuExample} from '../../../../packages/react/src/menu/menu.example.tsx';
import {ModalExample} from '../../../../packages/react/src/modal/modal.example.tsx';
import {NavigationItemExample} from '../../../../packages/react/src/navigation-item/navigation-item.example.tsx';
import {NavigationMenuExample} from '../../../../packages/react/src/navigation-menu/navigation-menu.example.tsx';
import {PageHeaderExample} from '../../../../packages/react/src/page-header/page-header.example.tsx';
import {PageExample} from '../../../../packages/react/src/page/page.example.tsx';
import {PaginationExample} from '../../../../packages/react/src/pagination/pagination.example.tsx';
import {PopoverExample} from '../../../../packages/react/src/popover/popover.example.tsx';
import {ProgressiveDisclosureExample} from '../../../../packages/react/src/progressive-disclosure/progressive-disclosure.example.tsx';
import {ProjectSwitcherExample} from '../../../../packages/react/src/project-switcher/project-switcher.example.tsx';
import {RadioExample} from '../../../../packages/react/src/radio/radio.example.tsx';
import {SearchAndFilterBarExample} from '../../../../packages/react/src/search-and-filter-bar/search-and-filter-bar.example.tsx';
import {SearchExample} from '../../../../packages/react/src/search/search.example.tsx';
import {SearchableListExample} from '../../../../packages/react/src/searchable-list/searchable-list.example.tsx';
import {SectionSeparatedExample, SectionUnseparatedExample} from '../../../../packages/react/src/section/section.example.tsx';
import {SegmentedControlExample} from '../../../../packages/react/src/segmented-control/segmented-control.example.tsx';
import {SelectionControlLabelExample} from '../../../../packages/react/src/selection-control-label/selection-control-label.example.tsx';
import {SeparatorHorizontalExample, SeparatorVerticalExample} from '../../../../packages/react/src/separator/separator.example.tsx';
import {SideNavigationExample} from '../../../../packages/react/src/side-navigation/side-navigation.example.tsx';
import {SocialLoginExample} from '../../../../packages/react/src/social-login/social-login.example.tsx';
import {StackExample} from '../../../../packages/react/src/stack/stack.example.tsx';
import {SwitchExample} from '../../../../packages/react/src/switch/switch.example.tsx';
import {TableOfContentsExample} from '../../../../packages/react/src/table-of-contents/table-of-contents.example.tsx';
import {TableExample} from '../../../../packages/react/src/table/table.example.tsx';
import {TabsExample} from '../../../../packages/react/src/tabs/tabs.example.tsx';
import {TextAreaExample} from '../../../../packages/react/src/text-area/text-area.example.tsx';
import {TextInlineExample, TextParagraphExample} from '../../../../packages/react/src/text/text.example.tsx';
import {TopNavigationExample} from '../../../../packages/react/src/top-navigation/top-navigation.example.tsx';
import {DocsAppearance} from './docs-appearance.tsx';
import {DocsSideNavigation} from './docs-side-navigation.tsx';
import {StrokeStyleToggle} from './stroke-style-toggle.tsx';

// An Astro island cannot pass React context to independently rendered MDX children.
// Keep each complete demo in one React tree; the provider adds no DOM or layout.
export function AppLayoutSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><AppLayoutExample /></DocsAppearance>;
}

export function ButtonSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><ButtonExample /></DocsAppearance>;
}

export function CardContentSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><CardContentExample /></DocsAppearance>;
}

export function CardSummarySurfacePreview(): React.JSX.Element {
  return <DocsAppearance><CardSummaryExample /></DocsAppearance>;
}

export function CheckboxSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><CheckboxExample /></DocsAppearance>;
}

export function CodeSnippetCopySurfacePreview(): React.JSX.Element {
  return <DocsAppearance><CodeSnippetCopyExample /></DocsAppearance>;
}

export function CodeSnippetSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><CodeSnippetExample /></DocsAppearance>;
}

export function ControlAndLabelSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><ControlAndLabelExample /></DocsAppearance>;
}

export function CopyButtonSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><CopyButtonExample /></DocsAppearance>;
}

export function DropdownSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><DropdownExample /></DocsAppearance>;
}

export function DropdownMultipleSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><DropdownMultipleExample /></DocsAppearance>;
}

export function DropdownRadioSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><DropdownRadioExample /></DocsAppearance>;
}

export function EmptyStateSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><EmptyStateExample /></DocsAppearance>;
}

export function FieldSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><FieldExample /></DocsAppearance>;
}

export function HeadingSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><HeadingExample /></DocsAppearance>;
}

export function IconButtonSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><IconButtonExample /></DocsAppearance>;
}

export function InputSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><InputExample /></DocsAppearance>;
}

export function KeyValueSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><KeyValueExample /></DocsAppearance>;
}

export function LinkSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><LinkExample /></DocsAppearance>;
}

export function MenuSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><MenuExample /></DocsAppearance>;
}

export function ModalSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><ModalExample /></DocsAppearance>;
}

export function NavigationItemSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><NavigationItemExample /></DocsAppearance>;
}

export function NavigationMenuSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><NavigationMenuExample /></DocsAppearance>;
}

export function PageSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><PageExample /></DocsAppearance>;
}

export function PageHeaderSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><PageHeaderExample /></DocsAppearance>;
}

export function PaginationSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><PaginationExample /></DocsAppearance>;
}

export function PopoverSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><PopoverExample /></DocsAppearance>;
}

export function ProgressiveDisclosureSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><ProgressiveDisclosureExample /></DocsAppearance>;
}

export function ProjectSwitcherSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><ProjectSwitcherExample /></DocsAppearance>;
}

export function RadioSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><RadioExample /></DocsAppearance>;
}

export function SearchAndFilterBarSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><SearchAndFilterBarExample /></DocsAppearance>;
}

export function SearchSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><SearchExample /></DocsAppearance>;
}

export function SearchableDropdownSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><SearchableDropdownExample /></DocsAppearance>;
}

export function SearchableListSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><SearchableListExample /></DocsAppearance>;
}

export function SectionSeparatedSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><SectionSeparatedExample /></DocsAppearance>;
}

export function SectionUnseparatedSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><SectionUnseparatedExample /></DocsAppearance>;
}

export function SegmentedControlSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><SegmentedControlExample /></DocsAppearance>;
}

export function SelectionControlLabelSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><SelectionControlLabelExample /></DocsAppearance>;
}

export function SeparatorHorizontalSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><SeparatorHorizontalExample /></DocsAppearance>;
}

export function SeparatorVerticalSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><SeparatorVerticalExample /></DocsAppearance>;
}

export function SideNavigationSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><SideNavigationExample /></DocsAppearance>;
}

export function SocialLoginSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><SocialLoginExample /></DocsAppearance>;
}

export function StackSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><StackExample /></DocsAppearance>;
}

export function SwitchSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><SwitchExample /></DocsAppearance>;
}

export function TableSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><TableExample /></DocsAppearance>;
}

export function TableOfContentsSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><TableOfContentsExample /></DocsAppearance>;
}

export function TabsSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><TabsExample /></DocsAppearance>;
}

export function TextAreaSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><TextAreaExample /></DocsAppearance>;
}

export function TextInlineSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><TextInlineExample /></DocsAppearance>;
}

export function TextParagraphSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><TextParagraphExample /></DocsAppearance>;
}

export function TopNavigationSurfacePreview(): React.JSX.Element {
  return <DocsAppearance><TopNavigationExample /></DocsAppearance>;
}

export function DocsNavigationSurfacePreview(props: ComponentProps<typeof DocsSideNavigation>): React.JSX.Element {
  return (
    <DocsAppearance>
      <StrokeStyleToggle />
      <DocsSideNavigation {...props} />
    </DocsAppearance>
  );
}
