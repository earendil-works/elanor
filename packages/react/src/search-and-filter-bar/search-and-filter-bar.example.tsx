import {Button} from '../button/button.tsx';
import {Search} from '../search/search.tsx';
import {SearchAndFilterBar} from './search-and-filter-bar.tsx';

export function SearchAndFilterBarExample(): React.JSX.Element {
  return (
    <SearchAndFilterBar search={<Search aria-label="Search" placeholder="Search" />}>
      <Button hierarchy="secondary">Filter</Button>
    </SearchAndFilterBar>
  );
}
