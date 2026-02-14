import { toPng } from "html-to-image";

export const exportElementToPng = async (element: HTMLElement, filename: string) => {
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#f6f3ef",
  });
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
};
