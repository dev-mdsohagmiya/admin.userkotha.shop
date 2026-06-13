"use client";

import { useEffect, useState } from "react";
import { Tabs } from "antd";
import { useSearchParams } from "react-router-dom";
import PageMeta from "../../../../components/common/Meta/PageMeta";

import Footer from "./Footer";
import DetailsPageMassage from "./DetailsPageMassage";
import Topbar from "./Topbar";
import PageHeader from "../../../../components/common/Navigation/PageHeader";

const CommonContent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("1");

  const items = [
    {
      key: "1",
      label: "Topbar",
      children: <Topbar />,
    },
    {
      key: "2",
      label: "Footer",
      children: <Footer />,
    },
    {
      key: "3",
      label: "Product Details",
      children: <DetailsPageMassage />,
    },
  ];

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (!tabParam) return;

    const normalized = tabParam.toLowerCase();
    const tabMap: Record<string, string> = {
      topbar: "1",
      footer: "2",
      product_details: "3",
      "product details": "3",
    };
    const nextTab = tabMap[normalized];
    if (nextTab && nextTab !== activeTab) {
      setActiveTab(nextTab);
    }
  }, [activeTab, searchParams]);

  return (
    <div>
      <PageMeta
        title="Common Sections | Amzad Food ERP"
        description="Manage common sections: Topbar, Footer, and Ads"
      />
      <PageHeader
        title="Common Sections"
        subtitle="Manage common sections"
        breadcrumbs={[{ title: "Dashboard" }, { title: "Common Sections" }]}
      />

      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          const params = new URLSearchParams(searchParams);
          const tabParamMap: Record<string, string> = {
            "1": "topbar",
            "2": "footer",
            "3": "product_details",
          };
          params.set("tab", (tabParamMap[key] || key).toLowerCase());
          setSearchParams(params);
        }}
        items={items}
      />
    </div>
  );
};

export default CommonContent;
