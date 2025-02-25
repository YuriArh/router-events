import type { getPublicEnvToExpose } from "env.server";

type Props = ReturnType<typeof getPublicEnvToExpose>;

declare global {
  interface Window {
    PUBLIC_ENV: Props;
  }
}

export const PublicEnv = (props: Props) => (
  <script
    dangerouslySetInnerHTML={{
      __html: `window.PUBLIC_ENV = ${JSON.stringify(props)};`,
    }}
  />
);
