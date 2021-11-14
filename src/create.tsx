import { Form, ActionPanel, SubmitFormAction, showToast, ToastStyle, closeMainWindow, popToRoot } from "@raycast/api";
import { getPreferenceValues } from "@raycast/api";
import Airtable from "airtable-plus";
import { useState } from "react";
import { Preferences, ShortLink } from "./types";

export default function Command() {
  const preferences: Preferences = getPreferenceValues();
  const { apiKey, baseID, tableName } = preferences;
  const [airtable] = useState<typeof Airtable>(new Airtable({ apiKey, baseID, tableName }));

  async function handleSubmit({ target, slug }: ShortLink) {
    try {
      await airtable.create({ target, slug });
      await showToast(ToastStyle.Success, "Submitted form", `Added ${slug}`);
      await popToRoot({ clearSearchBar: true });
    } catch (error: any) {
      await showToast(ToastStyle.Failure, error.toString());
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <SubmitFormAction onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="slug" title="Slug" placeholder="Enter the slug" />
      <Form.Separator />
      <Form.TextField id="target" title="Target URL" placeholder="Enter the target url" />
    </Form>
  );
}
