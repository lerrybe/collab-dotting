export const handleCopyLink = async (text: string) => {
  await navigator.clipboard.writeText(text);
};
