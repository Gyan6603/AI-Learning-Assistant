export async function getAIResponse(
  message: string
): Promise<string> {
  await new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });
  return `You asked : "${message}"`;
}