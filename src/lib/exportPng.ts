import { toPng } from "html-to-image";

const resolveExportBackground = (element: HTMLElement): string => {
  const isTransparent = (value: string) =>
    value === "transparent" || value === "rgba(0, 0, 0, 0)";

  const elementBg = window.getComputedStyle(element).backgroundColor;
  if (!isTransparent(elementBg)) return elementBg;

  const bodyBg = window.getComputedStyle(document.body).backgroundColor;
  if (!isTransparent(bodyBg)) return bodyBg;

  const rootBg = window.getComputedStyle(document.documentElement).backgroundColor;
  if (!isTransparent(rootBg)) return rootBg;

  return "#ffffff";
};

export const exportElementToPng = async (element: HTMLElement, filename: string) => {
  const backgroundColor = resolveExportBackground(element);
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor,
    skipFonts: true,
  });
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
};
