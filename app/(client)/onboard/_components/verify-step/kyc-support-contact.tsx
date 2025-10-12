import React from "react";
import { Mail, Copy, ChevronLeft, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { KycFormData, VerificationType } from "@/types/kyc.types";

interface KycSupportContactProps {
  formData: KycFormData;
  onBack: () => void;
}

export default function KycSupportContact({
  formData,
  onBack,
}: KycSupportContactProps) {
  const [showPreview, setShowPreview] = React.useState<boolean>(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getVerificationTypeInfo = () => {
    switch (formData.verificationType) {
      case VerificationType.OTC:
        return {
          title: "OTC Verification Required",
          description:
            "For over-the-counter transactions, our dedicated team will handle your verification personally.",
          benefits: [
            "Dedicated account manager",
            "Priority processing",
            "Enhanced due diligence",
            "Personalized support throughout the process",
          ],
          color: "bg-blue-50 border-blue-200 text-blue-800",
        };
      case VerificationType.INTERNAL:
        return {
          title: "Internal Verification Required",
          description:
            "Our compliance team will conduct a thorough manual review for maximum security.",
          benefits: [
            "Manual compliance review",
            "Enhanced security protocols",
            "Direct communication with our team",
            "Customized verification process",
          ],
          color: "bg-purple-50 border-purple-200 text-purple-800",
        };
      default:
        return {
          title: "Contact Our Team",
          description:
            "Our support team will assist you with your verification needs.",
          benefits: [
            "Professional assistance",
            "Secure verification process",
            "Quick response time",
          ],
          color: "bg-gray-50 border-gray-200 text-gray-800",
        };
    }
  };

  const verificationInfo = getVerificationTypeInfo();
  const supportEmail = "support@idrc.site";

  const generateEmailSubject = () => {
    const type =
      formData.verificationType === VerificationType.OTC ? "OTC" : "Internal";

    return `High-Value Investor ${type} Verification Request - ${formatCurrency(formData.investmentAmount)}`;
  };

  const generateEmailBody = () => {
    const verificationTypeText =
      formData.verificationType === VerificationType.OTC
        ? "OTC verification with dedicated support"
        : "internal manual verification";

    return (
      `Hello IDRC Team,%0D%0A%0D%0A` +
      `I am a high-value investor interested in verification for an investment of ${formatCurrency(formData.investmentAmount)}.%0D%0A%0D%0A` +
      `Investment Details:%0D%0A` +
      `- Amount: ${formatCurrency(formData.investmentAmount)}%0D%0A` +
      `- Verification Type: ${formData.verificationType}%0D%0A` +
      `- Name: ${formData.firstName} ${formData.lastName}%0D%0A%0D%0A` +
      `I would like to proceed with ${verificationTypeText}.%0D%0A%0D%0A` +
      `Please contact me to discuss the next steps.%0D%0A%0D%0A` +
      `Best regards,%0D%0A` +
      `${formData.firstName} ${formData.lastName}`
    );
  };

  const generatePlainEmailBody = () => {
    const verificationTypeText =
      formData.verificationType === VerificationType.OTC
        ? "OTC verification with dedicated support"
        : "internal manual verification";

    return `Hello IDRC Team,

I am a high-value investor interested in verification for an investment of ${formatCurrency(formData.investmentAmount)}.

Investment Details:
- Amount: ${formatCurrency(formData.investmentAmount)}
- Verification Type: ${formData.verificationType}
- Name: ${formData.firstName} ${formData.lastName}

I would like to proceed with ${verificationTypeText}.

Please contact me to discuss the next steps.

Best regards,
${formData.firstName} ${formData.lastName}`;
  };

  const openEmailClient = () => {
    const subject = encodeURIComponent(generateEmailSubject());
    const body = generateEmailBody();
    const mailtoUrl = `mailto:${supportEmail}?subject=${subject}&body=${body}`;

    window.open(mailtoUrl);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md">
      <button
        className="cursor-pointer hover:bg-gray-100 w-fit py-1.5 transition-all duration-200"
        type="button"
        onClick={onBack}
      >
        <ChevronLeft />
      </button>

      <div className="flex flex-col gap-5">
        <div className="text-left">
          <span className="text-black text-2xl font-semibold">
            {verificationInfo.title}
          </span>
          <p className="text-sm mt-2 text-gray-600">
            {verificationInfo.description}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-1">
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center mb-4 gap-2">
                    <Mail className="w-5 h-5" />
                    <h3 className="font-semibold">Email Our Team</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Send us a detailed message about your verification needs.
                    We&apos;ll respond within 2-4 hours during business hours.
                  </p>

                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {supportEmail}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(supportEmail, "Email")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      variant="purple"
                      onClick={openEmailClient}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(
                          generatePlainEmailBody(),
                          "Email content",
                        )
                      }
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {showPreview && (
          <Card className="border-2 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-blue-800">Email Preview</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowPreview(false)}
                >
                  <EyeOff className="w-4 h-4" />
                </Button>
              </div>

              <div className="bg-white border rounded-lg p-4 space-y-3">
                <div className="border-b pb-2">
                  <div className="text-sm text-gray-600 mb-1">
                    <strong>To:</strong> {supportEmail}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Subject:</strong> {generateEmailSubject()}
                  </div>
                </div>

                <div className="text-sm whitespace-pre-line text-gray-800 font-mono bg-gray-50 p-3 rounded">
                  {generatePlainEmailBody()}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <h4 className="font-semibold mb-2 text-yellow-800">Next Steps:</h4>
          <ol className="text-sm space-y-1 text-yellow-700">
            <li>1. Contact our team using email above</li>
            <li>
              2. Provide your investment details and verification preference
            </li>
            <li>
              3. Our team will guide you through the personalized verification
              process
            </li>
            <li>4. Complete verification and proceed with your investment</li>
          </ol>
        </div>

        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/account/overview")}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
