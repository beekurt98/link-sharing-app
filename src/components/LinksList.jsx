"use client";

import { Suspense, useEffect, useState } from "react";
import getPlatforms, {
  deleteLinkAction,
  getLinks,
  insertLinks,
  updateLinks,
} from "@/lib/action-links";

import NewLink from "./NewLink";
import styles from "@/styles/links.module.css";

export default function LinksList({ linkData, platformData }) {
  const [links, setLinks] = useState([]);
  const [dbLinks, setDbLinks] = useState([]);
  const [newLinks, setNewLinks] = useState([]);
  const [platforms, setPlatforms] = useState([]);

  useEffect(() => {
    async function getData() {
      setLinks(linkData);
      setDbLinks(linkData);
      setPlatforms(platformData);
    }
    getData();
  }, []);

  function handleNewLink() {
    const newLink = {
      id: crypto.randomUUID(),
      platform_id: platforms[0].id,
      url: "",
    };
    setNewLinks((prev) => [...prev, newLink]);
    setLinks((prev) => [...prev, newLink]);
  }

  async function deleteLink(link) {
    setLinks(links.filter((x) => x.id != link.id));
    setNewLinks(newLinks.filter((x) => x.id != link.id));

    if (dbLinks.find((x) => x.id === link.id)) {
      await deleteLinkAction(link.id);
    }
  }

  function updateLink(updatedLink) {
    setLinks(
      links.map((link) => (link.id === updatedLink.id ? updatedLink : link))
    );

    if (newLinks.find((link) => link.id === updatedLink.id)) {
      setNewLinks(
        newLinks.map((link) =>
          link.id === updatedLink.id ? updatedLink : link
        )
      );
    }
  }

  async function saveLinks() {
    const newLinksToSave = links.filter(
      (link) => !dbLinks.some((dbLink) => dbLink.id === link.id)
    );

    const existingLinksToUpdate = links.filter((link) =>
      dbLinks.some((dbLink) => dbLink.id === link.id)
    );

    if (newLinksToSave.length > 0) {
      const preparedLinks = newLinksToSave.map((link, index) => ({
        platform_id: link.platform_id,
        url: link.url,
        sequence: index,
      }));

      await insertLinks(preparedLinks);
    }

    for (const link of existingLinksToUpdate) {
      await updateLinks(link);
    }

    const updatedLinkData = await getLinks();
    setDbLinks(updatedLinkData);
    setLinks(updatedLinkData);
    setNewLinks([]);
  }

  return (
    <>
      <button onClick={handleNewLink} className={styles.addNewLinkBtn}>
        + Add new link
      </button>
      {links.length > 0 ? (
        <div className={styles.linksList}>
          {links?.map((x, index) => (
            <NewLink
              key={x?.id}
              link={x}
              index={index}
              deleteLink={deleteLink}
              updateLink={updateLink}
              platforms={platforms}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyListDiv}>
          <img src="/images/links-empty.svg" />
          <h2>Let's get you started</h2>
          <p>
            Use the “Add new link” button to get started. Once you have more
            than one link, you can reorder and edit them. We’re here to help you
            share your profiles with everyone!
          </p>
        </div>
      )}
      <hr className={styles.hr} />
      <button
        disabled={links.length == 0 ? true : false}
        onClick={saveLinks}
        className={styles.saveBtn}
      >
        Save
      </button>
    </>
  );
}
