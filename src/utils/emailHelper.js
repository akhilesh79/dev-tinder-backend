const { SendEmailCommand } = require('@aws-sdk/client-ses');
const { sesClient } = require('../config/sesClient');

const createSendEmailCommand = (toAddress, fromAddress, ccAddresses = [], subject, bodyHtml) => {
  return new SendEmailCommand({
    Destination: {
      CcAddresses: [...(Array.isArray(ccAddresses) ? ccAddresses : [ccAddresses])],
      ToAddresses: [...(Array.isArray(toAddress) ? toAddress : [toAddress])],
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: bodyHtml || 'HTML_FORMAT_BODY',
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject || 'Request to connect on DevTinder',
      },
    },
    Source: fromAddress,
    ReplyToAddresses: [
      /* more items */
    ],
  });
};

const sendEmail = async (toAddress, ccAddresses = [], subject, bodyHtml) => {
  const sendEmailCommand = createSendEmailCommand(toAddress, process.env.FROM_EMAIL, ccAddresses, subject, bodyHtml);

  try {
    return await sesClient.send(sendEmailCommand);
  } catch (caught) {
    if (caught instanceof Error && caught.name === 'MessageRejected') {
      const messageRejectedError = caught;
      return messageRejectedError;
    }
    throw caught;
  }
};

module.exports = { sendEmail };
