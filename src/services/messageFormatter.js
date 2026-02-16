export function formatProductMessage(product, options = {}) {
  const { prefix = "", suffix = "", language = "he" } = options;

  const priceText =
    product.originalPrice
      ? `~${product.originalPrice} ${product.currency}~ ➜ *${product.price} ${product.currency}*`
      : `*${product.price} ${product.currency}*`;

  const lines = [
    prefix,
    `*${product.name}*`,
    "",
    product.description,
    "",
    priceText,
    "",
    product.affiliateLink,
    suffix,
  ];

  return lines.filter((line) => line !== undefined && line !== null).join("\n").trim();
}
