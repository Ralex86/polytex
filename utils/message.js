var moment = require('moment');

var generateMessage = (from, body, latex) => {
  return {
    from,
    body,
    createdAt: moment().format('HH:mm'),
    latex,
  }
}

module.exports = {generateMessage}
