export function stringToColor(str: string): string {
  const colors = ['#FF90B5', '#7AC8FF', '#78E8C8', '#FFB878', '#B090FF', '#FF6080'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
