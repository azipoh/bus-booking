import { ExternalLink, ClipboardList, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const formUrl = (import.meta.env.VITE_GOOGLE_FORM_URL || '').trim();
const isGoogleFormUrl = formUrl.includes('docs.google.com/forms');

const Questionnaire = () => {
  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ClipboardList className="h-7 w-7" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Customer Questionnaires
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Collect feedback from passengers and parcel customers with a Google Form that is easy to share and answer.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="overflow-hidden border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Share your questionnaire</CardTitle>
              <CardDescription>
                Add your Google Form link in the app configuration and let users answer directly from this page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {!formUrl ? (
                <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 text-sm text-muted-foreground">
                  Set the <span className="font-semibold text-foreground">VITE_GOOGLE_FORM_URL</span> environment variable to your Google Form URL to enable the questionnaire here.
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/40 p-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="font-medium text-foreground">Questionnaire ready to open</span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button asChild className="gap-2">
                      <a href={formUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        Open Google Form
                      </a>
                    </Button>
                  </div>
                </>
              )}

              <div className="space-y-2 rounded-xl border border-border/70 bg-card p-4 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Suggested use cases</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Passenger satisfaction feedback</li>
                  <li>Parcel delivery experience survey</li>
                  <li>Service improvement questionnaire</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Embedd or link</CardTitle>
              <CardDescription>
                Use the embedded view when your Google Form URL is a Google Forms embed link.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formUrl && isGoogleFormUrl ? (
                <iframe
                  src={formUrl}
                  title="Moghamo questionnaire"
                  className="min-h-[420px] w-full rounded-xl border border-border bg-white"
                  loading="lazy"
                />
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                  {formUrl
                    ? 'Use a Google Forms embed URL such as the “embedded” link from your form to preview it here.'
                    : 'Once a form URL is configured, it will appear here directly.'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
