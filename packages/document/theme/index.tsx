import Tags from '@/components/Tags';
// https://rspress.dev/guide/advanced/custom-theme#2-use-slot
import { usePageData } from 'rspress/runtime';
import { Layout as DefaultLayout } from 'rspress/theme';
import componentStyles from './components.module.css';

// Show all props below
const Layout = () => {
  const { siteData, page } = usePageData();
  // debugger;
  const tags = page.frontmatter.tags as string[] | undefined;
  return (
    <DefaultLayout
      // /* Before home hero */
      // beforeHero={<div>beforeHero</div>}
      // /* After home hero */
      // afterHero={<div>afterHero</div>}
      // /* Before home features */
      // beforeFeatures={<div>beforeFeatures</div>}
      // /* After home features */
      // afterFeatures={<div>afterFeatures</div>}
      // /* Before doc footer */
      // beforeDocFooter={<div>beforeDocFooter</div>}
      // /* After doc footer */
      // afterDocFooter={<div>afterDocFooter</div>}
      // /* Doc page front */
      // beforeDoc={<div>beforeDoc</div>}
      /* Doc page end */
      // afterDoc={<div>afterDoc</div>}
      // /* Doc content front */
      beforeDocContent={
        <div>
          <Tags tags={tags} />
        </div>
      }
      // /* Doc content end */
      afterDocContent={<div></div>}
      // /* Before the nav bar */
      // beforeNav={<div>beforeNav</div>}
      // /* Before the title of the nav bar in the upper left corner */
      // beforeNavTitle={<span>😄</span>}
      // /* Nav bar title */
      // navTitle={<div>Custom Nav Title</div>}
      // /* After the title of the nav bar in the upper left corner */
      // afterNavTitle={<div>afterNavTitle</div>}
      // /* The right corner of the nav menu */
      // afterNavMenu={<div>afterNavMenu</div>}
      // /* Above the left sidebar */
      // beforeSidebar={<div>beforeSidebar</div>}
      // /* Below the left sidebar */
      // afterSidebar={<div>afterSidebar</div>}
      // /* Above the right outline column */
      // beforeOutline={<div>beforeOutline</div>}
      // /* Below the outline column on the right */
      // afterOutline={<div>afterOutline</div>}
      // /* Top of the entire page */
      // top={<div>top</div>}
      // /* Bottom of the entire page */
      // bottom={<div>bottom</div>}
      /* Custom MDX components */
      components={{
        p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
          <p {...props} className={componentStyles.paragraph} />
        ),
      }}
    />
  );
};

export { Layout };

export * from 'rspress/theme';
