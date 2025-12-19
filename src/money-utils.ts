import { RATES } from "./rate";

/**
 * 将订单金额字符串转换为数字（按汇率换算），返回保留两位小数的字符串
 * @param orderTotalCostStr - 金额字符串，例如 "$5.49" 或 "£5.49"
 * @param country - 可选国家代码，例如 'us'，用于查找汇率
 * @param rate - 可选汇率，优先使用此值
 */
export function getAmountFromStr(
  orderTotalCostStr: string,
  country?: string,
  rate?: number,
): string {
  // 如果没有传入 rate，则尝试用 country 查找
  if (rate === undefined) {
    if (country && country.toLowerCase() in RATES) {
      rate = RATES[country.toLowerCase()];
    } else {
      throw new Error(
        `Cannot determine rate: country=${country} rate=${rate}`,
      );
    }
  }

  return (Number(orderTotalCostStr.replace(/[$£]/g, "")) * rate).toFixed(2);
}

