export default function toTime (val) {
  let hours = 0
  let minutes = 0
  let seconds = Math.ceil(val / 1000)

  if (seconds >= 60) {
    minutes = Math.floor(seconds / 60)
    seconds -= minutes * 60
  }

  if (minutes >= 60) {
    hours = Math.floor(minutes / 60)
    minutes -= hours * 60
  }

  return ('0' + hours).slice(-2) + ':' +
    ('0' + minutes).slice(-2) + ':' +
    ('0' + seconds).slice(-2)
}
