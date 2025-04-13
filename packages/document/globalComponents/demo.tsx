import { useEffect } from 'react';
import { useLocation } from 'rspress/runtime';

// Need a default export
export default function PluginSideEffect() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Executed when the component renders for the first time
  }, []);

  useEffect(() => {
    // Executed when the route changes
  }, [pathname]);
  return (
    <script
      async
      src="//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js"
    />
  );
}
