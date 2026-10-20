import * as en from "./en/questions";
import * as hu from "./hu/questions";
import type { Locale } from "../../lib/i18n";

export const getQuestionContent = (locale: Locale) => locale === "hu" ? hu : en;
