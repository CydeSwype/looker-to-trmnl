// Pipedream step: Parse Gmail email and extract report data
// This step receives the Gmail email object and extracts content/attachments

// For Pipedream v1 (most common)
export default async (event, steps) => {
  const email = steps.trigger.event || event;
  
  // Extract email metadata
  const emailData = {
    subject: email.subject || '',
    from: email.from || '',
    date: email.date || new Date().toISOString(),
    body: '',
    attachments: []
  };
  
  // Extract email body (text or HTML)
  if (email.textPlain) {
    emailData.body = email.textPlain;
  } else if (email.textHtml) {
    // Strip HTML tags for plain text extraction
    emailData.body = email.textHtml.replace(/<[^>]*>/g, '');
  }
  
  // Extract attachments
  if (email.attachments && email.attachments.length > 0) {
    for (const attachment of email.attachments) {
      const attachmentData = {
        filename: attachment.filename || 'unknown',
        mimeType: attachment.mimeType || 'application/octet-stream',
        size: attachment.size || 0,
        attachmentId: attachment.attachmentId
      };
      
      // Download attachment content if it's a CSV or text file
      if (attachment.mimeType === 'text/csv' || 
          attachment.mimeType === 'text/plain' ||
          attachment.filename.endsWith('.csv')) {
        try {
          // Use Gmail API to get attachment content
          // In Pipedream, the Gmail app is available via this.$gmail
          const gmail = this.$gmail;
          const attachmentResponse = await gmail.users.messages.attachments.get({
            userId: 'me',
            messageId: email.id,
            id: attachment.attachmentId
          });
          
          // Decode base64 content
          const content = Buffer.from(attachmentResponse.data.data, 'base64').toString('utf-8');
          attachmentData.content = content;
        } catch (error) {
          console.error(`Error downloading attachment ${attachment.filename}:`, error);
          // If attachment download fails, try to get it from the email object directly
          if (attachment.data) {
            attachmentData.content = Buffer.from(attachment.data, 'base64').toString('utf-8');
          }
        }
      }
      
      emailData.attachments.push(attachmentData);
    }
  }
  
  return emailData;
};

// Alternative: For Pipedream v2 (if using defineComponent)
// Uncomment below if your Pipedream account uses v2
/*
import { defineComponent } from "@pipedream/types";

export default defineComponent({
  props: {},
  async run({ steps, $ }) {
    const email = steps.trigger.event;
    // ... rest of the code above ...
  },
});
*/
