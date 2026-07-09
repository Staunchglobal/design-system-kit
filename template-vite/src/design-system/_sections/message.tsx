import { BotIcon, UserIcon } from 'lucide-react'
import { ComponentSection, Example } from '@/design-system/_lib/showcase'
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader } from '@/components/ui/message'

export default function MessageDemo() {
  return (
    <ComponentSection
        id="message"
        title="Message"
        description="Structured chat message with avatar, header, content, and footer."
      >
        <Example title="Messages">
          <MessageGroup className="w-full max-w-md">
            <Message align="start">
              <MessageAvatar className="size-8">
                <BotIcon className="size-4" />
              </MessageAvatar>
              <MessageContent>
                <MessageHeader>
                  <span className="text-foreground font-medium">Assistant</span>
                  <span className="ml-2">9:41 AM</span>
                </MessageHeader>
                <div className="bg-muted w-fit max-w-[80%] rounded-xl px-3 py-2 text-sm">
                  Here is a summary of the changes.
                </div>
                <MessageFooter>Read</MessageFooter>
              </MessageContent>
            </Message>
            <Message align="end">
              <MessageAvatar className="size-8">
                <UserIcon className="size-4" />
              </MessageAvatar>
              <MessageContent>
                <MessageHeader>
                  <span className="text-foreground font-medium">You</span>
                  <span className="ml-2">9:42 AM</span>
                </MessageHeader>
                <div className="bg-primary text-primary-foreground w-fit max-w-[80%] rounded-xl px-3 py-2 text-sm">
                  Looks good, ship it.
                </div>
                <MessageFooter>Sent</MessageFooter>
              </MessageContent>
            </Message>
            <Message align="start">
              <MessageAvatar className="size-8">
                <BotIcon className="size-4" />
              </MessageAvatar>
              <MessageContent>
                <MessageHeader>
                  <span className="text-foreground font-medium">Assistant</span>
                  <span className="ml-2">9:43 AM</span>
                </MessageHeader>
                <div className="bg-muted w-fit max-w-[80%] rounded-xl px-3 py-2 text-sm">
                  Deployed to production.
                </div>
              </MessageContent>
            </Message>
          </MessageGroup>
        </Example>
      </ComponentSection>
  )
}
