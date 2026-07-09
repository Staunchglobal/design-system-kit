import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'

export default function TypographySection() {
  return (
    <ComponentSection
      id="typography"
      title="Typography"
      description="Drop-in text styles — add typography-h1 … typography-overline to any element, anywhere, to set its font family, size, weight, line height, and letter spacing in one go. They never set color, so pair them with a color utility (e.g. typography-h3 text-muted-foreground). Defined in src/styles/component-theme.css."
    >
      <Example
        title="Display & Headings"
        description="typography-display, typography-h1 … typography-h6"
      >
        <div className="w-full space-y-4">
          <div className="typography-display">Display</div>
          <h1 className="typography-h1">Heading 1</h1>
          <h2 className="typography-h2">Heading 2</h2>
          <h3 className="typography-h3">Heading 3</h3>
          <h4 className="typography-h4">Heading 4</h4>
          <h5 className="typography-h5">Heading 5</h5>
          <h6 className="typography-h6">Heading 6</h6>
        </div>
      </Example>

      <Example
        title="Body Text"
        description="typography-lead, typography-large, typography-p, typography-small, typography-muted"
      >
        <div className="w-full space-y-3">
          <p className="typography-lead text-muted-foreground">
            A modal dialog that interrupts the user with important content.
          </p>
          <p className="typography-large">Are you absolutely sure?</p>
          <p className="typography-p">
            The king thought long and hard, and finally came up with a brilliant plan: he would
            disguise himself as a peasant and travel through the land, learning the joys and
            hardships of his people.
          </p>
          <p className="typography-small">Email address</p>
          <p className="typography-muted text-muted-foreground">Enter your email address.</p>
        </div>
      </Example>

      <Example title="Blockquote & Code" description="typography-blockquote, typography-code">
        <div className="w-full space-y-4">
          <blockquote className="typography-blockquote">
            &ldquo;After all,&rdquo; he said, &ldquo;everyone enjoys a good joke, so it&apos;s only
            fair that they should pay for the privilege.&rdquo;
          </blockquote>
          <p className="typography-p">
            On your first project, run <code className="typography-code">npx shadcn init</code> to
            get started.
          </p>
        </div>
      </Example>

      <Example title="Caption & Overline" description="typography-caption, typography-overline">
        <div className="w-full space-y-3">
          <p className="typography-overline text-muted-foreground">New feature</p>
          <p className="typography-caption text-muted-foreground">
            Figure 1. Monthly active users, last 12 months.
          </p>
        </div>
      </Example>

      <Example
        title="Table"
        description="Content pattern — spacing/borders, scoped under data-slot='typography'"
        contentClassName="block"
      >
        <div data-slot="typography">
          <table className="my-6 w-full overflow-y-auto">
            <thead>
              <tr className="even:bg-muted m-0 border-t p-0">
                <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                  King&apos;s Treasury
                </th>
                <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                  People&apos;s happiness
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="even:bg-muted m-0 border-t p-0">
                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                  Empty
                </td>
                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                  Overflowing
                </td>
              </tr>
              <tr className="even:bg-muted m-0 border-t p-0">
                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                  Modest
                </td>
                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                  Satisfied
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Example>

      <Example
        title="List"
        description="Content pattern — spacing/markers, scoped under data-slot='typography'"
      >
        <div data-slot="typography">
          <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
            <li>1st level of Neptune&apos;s trident</li>
            <li>2nd level of Neptune&apos;s trident</li>
            <li>3rd level of Neptune&apos;s trident</li>
          </ul>
        </div>
      </Example>
    </ComponentSection>
  )
}
