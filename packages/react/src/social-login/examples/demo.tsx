import {Stack, Text, SocialLogin} from '@earendil-works/elanor-react';
import {useState} from 'react';

export default function SocialLoginDemo() {
  const [message, setMessage] = useState('Demo only. No account will be connected.');

  return (
    <Stack gap="small">
      <SocialLogin
        icon={<GoogleIcon />}
        onClick={() => setMessage('Google sign-in selected. This example does not authenticate.')}
      >
        Continue with Google
      </SocialLogin>
      <Text role="status">{message}</Text>
    </Stack>
  );
}

// Provider artwork from the Figma Social login component's exported asset.
function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="15.5907"
      height="16"
      viewBox="0 0 15.5907 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.11533 7.28V9.46667H13.342C13.182 10.6933 12.7733 11.5913 12.1507 12.222C11.386 12.9867 10.1953 13.822 8.11533 13.822C4.89733 13.822 2.382 11.2267 2.382 8.00867C2.382 4.79067 4.89733 2.19533 8.11533 2.19533C9.84867 2.19533 11.12 2.88 12.0533 3.76L13.5913 2.222C12.2933 0.96 10.5507 0 8.11533 0C3.70667 0 0 3.59133 0 8C0 12.4087 3.70667 16 8.11533 16C10.4973 16 12.2933 15.218 13.6973 13.76C15.1373 12.32 15.5907 10.2847 15.5907 8.64867C15.5907 8.142 15.5553 7.67067 15.4753 7.28H8.11533Z"
        fill="currentColor"
      />
    </svg>
  );
}
