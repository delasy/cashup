export default function toEpoch (val) {
  return ('000000' + val).slice(-6).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
