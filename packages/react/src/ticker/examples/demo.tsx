import {
  DescriptionIcon,
  EditIcon,
  SearchIcon,
  TerminalIcon,
} from '@earendil-works/elanor-icons-react';
import {Ticker} from '@earendil-works/elanor-react';
import {useEffect, useState} from 'react';

const STEPS = [
  {icon: <SearchIcon />, label: 'Searching the docs'},
  {icon: <DescriptionIcon />, label: 'Reading drawer.tsx'},
  {icon: <EditIcon />, label: 'Editing drawer.tsx'},
  {icon: <TerminalIcon />, label: 'Running the tests'},
];

export default function TickerDemo() {
  const [count, setCount] = useState(1);
  useEffect(() => {
    const timer = setInterval(() => setCount((value) => Math.min(value + 1, 12)), 1800);
    return () => clearInterval(timer);
  }, []);
  return (
    <Ticker.Root active={count < 12}>
      {Array.from({length: count}, (_, index) => {
        const step = STEPS[index % STEPS.length]!;
        return (
          <Ticker.Item key={index} label={step.label}>
            {step.icon}
            <span>{step.label}</span>
          </Ticker.Item>
        );
      })}
    </Ticker.Root>
  );
}
