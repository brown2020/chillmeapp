import { renderTermsHtml } from "./terms-content";

type Props = {
  companyName: string;
  companyEmail: string;
  privacyLink: string;
  updatedAt: string;
};

export default function Terms(props: Props) {
  return <div dangerouslySetInnerHTML={{ __html: renderTermsHtml(props) }} />;
}
