import {
  ActionPanel,
  Form,
  getPreferenceValues,
  List,
  OpenInBrowserAction,
  PushAction,
  showToast,
  SubmitFormAction,
  ToastStyle,
  useNavigation,
} from "@raycast/api";
import Airtable from "airtable-plus";
import { useEffect, useState } from "react";
import { Preferences, ShortLink } from "./types";

export interface ShortLinkResponse {
  fields: ShortLink;
}

export default function Command() {
  const preferences: Preferences = getPreferenceValues();
  const { apiKey, baseID, tableName } = preferences;
  const [airtable] = useState<typeof Airtable>(new Airtable({ apiKey, baseID, tableName }));
  const [isLoading, setIsLoading] = useState(true);
  const [links, setLinks] = useState<ShortLink[]>([]);

  useEffect(() => {
    const getShortlinks = async () => {
      const res: ShortLinkResponse[] = await airtable.read();
      setLinks(res.map((item) => item.fields));
      setIsLoading(false);
    };

    getShortlinks();
  }, []);

  const deleteLink = async (slug: string) => {
    try {
      await airtable.deleteWhere(`slug = "${slug}"`);
      setLinks(links.filter(({ slug: linkSlug }) => linkSlug !== slug));
    } catch (error: any) {
      await showToast(ToastStyle.Failure, error.toString());
    }
  };

  const UpdateLinkAction = (props: {
    existingLink: ShortLink;
    onSubmit: (slug: string, shortlink: ShortLink) => void;
  }) => {
    const { existingLink, onSubmit } = props;
    return <PushAction title="Update Todo" target={<UpdateLinkForm link={existingLink} onSubmit={onSubmit} />} />;
  };

  const handleSubmit = async (slug: string, { slug: newSlug, target: newTarget }: ShortLink) => {
    try {
      airtable.updateWhere(`slug = "${slug}"`, { slug: newSlug, target: newTarget });
      setLinks([{ slug: newSlug, target: newTarget }, ...links.filter(({ slug: linkSlug }) => linkSlug !== slug)]);
    } catch (error: any) {
      await showToast(ToastStyle.Failure, error.toString());
    }
  };

  return (
    <List
      navigationTitle="Search shortlinks"
      searchBarPlaceholder="Search through all shortlinks at dotco"
      isLoading={isLoading}
      onSelectionChange={(id) => console.log(id)}
    >
      {links.length > 0 &&
        links.map(({ slug, target }, index) => (
          <List.Item
            title={slug}
            subtitle={target}
            key={index}
            actions={
              <ActionPanel>
                <OpenInBrowserAction url={target} />
                <UpdateLinkAction
                  existingLink={{ slug, target }}
                  onSubmit={(slug: string, link: ShortLink) => handleSubmit(slug, link)}
                />
                <ActionPanel.Item title="Delete" onAction={() => deleteLink(slug)} />
              </ActionPanel>
            }
          />
        ))}
    </List>
  );
}
const UpdateLinkForm = (props: { link: ShortLink; onSubmit: (slug: string, shortlink: ShortLink) => void }) => {
  const { pop } = useNavigation();
  const {
    link: { slug, target },
    onSubmit,
  } = props;

  const handleSubmit = async (link: ShortLink) => {
    onSubmit(slug, link);
    pop();
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <SubmitFormAction onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="slug" title="Slug" placeholder="Enter the slug" defaultValue={slug} />
      <Form.Separator />
      <Form.TextField id="target" title="Target URL" placeholder="Enter the target url" defaultValue={target} />
    </Form>
  );
};
