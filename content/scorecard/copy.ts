import * as en from "./en/copy";
import * as hu from "./hu/copy";
import type { Locale } from "../../lib/i18n";

export const getScorecardCopy = (locale: Locale) => locale === "hu" ? hu : en;
