import _ from "lodash";

const toPlainObject = <T = object>(obj: object) => {
  return JSON.parse(JSON.stringify(obj)) as T;
};

const getUsagePricing = ({ perSecond }: { perSecond?: boolean }) => {
  /* Pricing values are based on pricing per minute */
  const pricing = {
    conferencing: 0.004,
    recording: 0.0135,
    postTranscription: 0.004,
    aiSummary: 0.0035,
  };

  if (perSecond) {
    const modified = _.forOwn(pricing, (v) => v / 60);
    return modified;
  }
  return pricing;
};

const calculateAvailableConferencingSeconds = (
  totalCredits: number,
): number => {
  const { conferencing } = getUsagePricing({ perSecond: true });
  return conferencing * totalCredits;
};

const calculateDeductableCredits = (seconds: number) => {
  const { conferencing } = getUsagePricing({ perSecond: true });
  return parseFloat((conferencing * seconds).toFixed(2));
};

export {
  toPlainObject,
  getUsagePricing,
  calculateAvailableConferencingSeconds,
  calculateDeductableCredits,
};
