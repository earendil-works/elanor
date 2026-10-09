import {Card, Heading, Stack, Text, Grid, type GridColumns} from '@earendil-works/elanor-react';
import {useState} from 'react';

const cellStyle = {
  background: 'var(--semantic-color-background-fill-secondary)',
  borderRadius: 'var(--semantic-dimension-radius-small)',
};

export function GridExample() {
  const [width, setWidth] = useState(100);
  const [columns, setColumns] = useState<GridColumns>(12);
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');
  return (
    <Stack align="stretch" gap="large" style={{inlineSize: '100%'}}>
      <Heading level={2}>Container-responsive cards</Heading>
      <Text>
        Resize the grid without resizing the viewport. Cards use 6 columns at xSmall and 4 at small.
      </Text>
      <Stack direction="row" wrap="wrap" gap="large">
        <label>
          Container width: {width}%
          <input
            aria-label="Grid container width"
            type="range"
            min={20}
            max={100}
            value={width}
            onChange={(event) => setWidth(event.currentTarget.valueAsNumber)}
          />
        </label>
        <label>
          Direction{' '}
          <select
            value={direction}
            onChange={(event) => setDirection(event.currentTarget.value as 'ltr' | 'rtl')}
          >
            <option value="ltr">Left to right</option>
            <option value="rtl">Right to left</option>
          </select>
        </label>
      </Stack>
      <div style={{inlineSize: `${width}%`}} dir={direction}>
        <Grid.Root aria-label="Responsive cards">
          {['Overview', 'Usage', 'Activity', 'Members', 'Settings', 'Billing'].map((label) => (
            <Grid.Item
              key={label}
              span={{base: 'full', xSmall: 6, small: 4}}
              render={<Card style={cellStyle} />}
            >
              {label}
            </Grid.Item>
          ))}
        </Grid.Root>
      </div>

      <Heading level={2}>One through twelve columns</Heading>
      <label>
        Columns{' '}
        <select
          value={columns}
          onChange={(event) => setColumns(Number(event.currentTarget.value) as GridColumns)}
        >
          {Array.from({length: 12}, (_, index) => index + 1).map((count) => (
            <option key={count}>{count}</option>
          ))}
        </select>
      </label>
      <Grid.Root columns={columns} aria-label="Configurable columns" dir={direction}>
        {Array.from({length: columns}, (_, index) => (
          <Grid.Item key={index} span={1} render={<Card style={cellStyle} />}>
            {index + 1}
          </Grid.Item>
        ))}
        <Grid.Item render={<Card style={cellStyle} />}>
          Default: full width, regardless of column count.
        </Grid.Item>
        <Grid.Item span={12} render={<Card style={cellStyle} />}>
          An oversized span is clamped to the available tracks.
        </Grid.Item>
      </Grid.Root>

      <Heading level={2}>Shared columns with subgrid</Heading>
      <Text>
        Search uses 4 tracks. Filters share the other 8; each filter spans 2. Narrow layouts stack.
      </Text>
      <div style={{inlineSize: `${width}%`}} dir={direction}>
        <Grid.Root aria-label="Shared columns">
          <Grid.Item span={{base: 'full', xSmall: 4}} render={<Card style={cellStyle} />}>
            Search
          </Grid.Item>
          <Grid.Subgrid span={{base: 'full', xSmall: 8}}>
            <Grid.Item render={<Card style={cellStyle} />}>
              Filters: aligned parent tracks, independent rows
            </Grid.Item>
            {['Status', 'Owner', 'Region', 'Period'].map((label) => (
              <Grid.Item
                key={label}
                span={{base: 'full', xSmall: 2}}
                render={<Card style={cellStyle} />}
              >
                {label}
              </Grid.Item>
            ))}
          </Grid.Subgrid>
        </Grid.Root>
      </div>

      <Heading level={2}>Independent nested grids</Heading>
      <Text>
        A nested Root measures its own width, not the outer grid. Both nested grids have 5 tracks.
      </Text>
      <Grid.Root aria-label="Independent nesting" dir={direction}>
        {([4, 8] as const).map((span) => (
          <Grid.Item key={span} span={{base: 'full', small: span}}>
            <Grid.Root columns={5} gap="small">
              <Grid.Item render={<Card style={cellStyle} />}>
                Nested inside {span} parent tracks
              </Grid.Item>
              <Grid.Item span={{base: 'full', xSmall: 2}} render={<Card style={cellStyle} />}>
                First
              </Grid.Item>
              <Grid.Item span={{base: 'full', xSmall: 3}} render={<Card style={cellStyle} />}>
                Second
              </Grid.Item>
            </Grid.Root>
          </Grid.Item>
        ))}
      </Grid.Root>
    </Stack>
  );
}
