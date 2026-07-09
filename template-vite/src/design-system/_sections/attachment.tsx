import { FileTextIcon, ImageIcon, XIcon } from 'lucide-react'
import { ComponentSection, Example, ExampleGrid } from '@/design-system/_lib/showcase'
import { Attachment, AttachmentAction, AttachmentActions, AttachmentContent, AttachmentDescription, AttachmentGroup, AttachmentMedia, AttachmentTitle, AttachmentTrigger } from '@/components/ui/attachment'

export default function AttachmentDemo() {
  return (
    <ComponentSection
        id="attachment"
        title="Attachment"
        description="File and image attachment cards with actions, sizes, and states."
      >
        <ExampleGrid>
          <Example title="File attachment" description="Icon media with a remove action.">
            <Attachment>
              <AttachmentMedia variant="icon">
                <FileTextIcon />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>document.pdf</AttachmentTitle>
                <AttachmentDescription>248 KB</AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction aria-label="Remove attachment">
                  <XIcon />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
          </Example>

          <Example title="Image attachment" description="Image media, vertical orientation.">
            <Attachment orientation="vertical">
              <AttachmentMedia variant="image">
                <div className="text-muted-foreground flex size-full items-center justify-center">
                  <ImageIcon />
                </div>
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>cover.png</AttachmentTitle>
                <AttachmentDescription>1.2 MB</AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction aria-label="Remove attachment">
                  <XIcon />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
          </Example>

          <Example title="Sizes" description="Default, small, and extra small.">
            <Attachment size="default">
              <AttachmentMedia>
                <FileTextIcon />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>report.docx</AttachmentTitle>
                <AttachmentDescription>Default</AttachmentDescription>
              </AttachmentContent>
            </Attachment>
            <Attachment size="sm">
              <AttachmentMedia>
                <FileTextIcon />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>report.docx</AttachmentTitle>
                <AttachmentDescription>Small</AttachmentDescription>
              </AttachmentContent>
            </Attachment>
            <Attachment size="xs">
              <AttachmentMedia>
                <FileTextIcon />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>report.docx</AttachmentTitle>
                <AttachmentDescription>Extra small</AttachmentDescription>
              </AttachmentContent>
            </Attachment>
          </Example>

          <Example title="States" description="Idle, uploading, and error states.">
            <Attachment state="idle">
              <AttachmentMedia>
                <FileTextIcon />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>drop-file.zip</AttachmentTitle>
                <AttachmentDescription>Waiting</AttachmentDescription>
              </AttachmentContent>
            </Attachment>
            <Attachment state="uploading">
              <AttachmentMedia>
                <FileTextIcon />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>uploading.zip</AttachmentTitle>
                <AttachmentDescription>Uploading…</AttachmentDescription>
              </AttachmentContent>
            </Attachment>
            <Attachment state="error">
              <AttachmentMedia>
                <FileTextIcon />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>failed.zip</AttachmentTitle>
                <AttachmentDescription>Upload failed</AttachmentDescription>
              </AttachmentContent>
            </Attachment>
          </Example>
        </ExampleGrid>

        <Example
          title="Attachment group"
          description="Horizontally scrollable row of clickable attachments, e.g. inside a composer."
        >
          <AttachmentGroup className="w-full max-w-md">
            <Attachment className="relative">
              <AttachmentTrigger aria-label="Open document.pdf" />
              <AttachmentMedia>
                <FileTextIcon />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>document.pdf</AttachmentTitle>
                <AttachmentDescription>248 KB</AttachmentDescription>
              </AttachmentContent>
            </Attachment>
            <Attachment className="relative">
              <AttachmentTrigger aria-label="Open invoice.pdf" />
              <AttachmentMedia>
                <FileTextIcon />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>invoice.pdf</AttachmentTitle>
                <AttachmentDescription>96 KB</AttachmentDescription>
              </AttachmentContent>
            </Attachment>
          </AttachmentGroup>
        </Example>
      </ComponentSection>
  )
}
