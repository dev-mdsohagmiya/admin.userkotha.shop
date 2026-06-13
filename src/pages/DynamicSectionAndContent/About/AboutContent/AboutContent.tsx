"use client";

import { Tabs } from "antd";
import TabPane from "antd/es/tabs/TabPane";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import PageMeta from "../../../../components/common/Meta/PageMeta";
import PageHeader from "../../../../components/common/Navigation/PageHeader";
import Banner from "../Banner/Banner";
import OurStory from "../OurStory/OurStory";
import MissionVision from "../MissionVision/MissionVision";
import CoreValues from "../CoreValues/CoreValues";

const AboutContent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("1");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (!tabParam) return;

    const normalized = tabParam.toLowerCase();
    const tabMap: Record<string, string> = {
      banner: "1",
      "our story": "2",
      our_story: "2",
      "mission & vision": "3",
      mission_vision: "3",
      "core values": "4",
      core_values: "4",
    };

    const nextTab = tabMap[normalized];
    if (nextTab && nextTab !== activeTab) {
      setActiveTab(nextTab);
    }
  }, [activeTab, searchParams]);

  return (
    <div>
      <PageMeta
        title="About Section | Amzad Food ERP"
        description="Manage about content"
      />

      <PageHeader
        title="About Section"
        subtitle="View and manage all About Section"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "About Section" },
        ]}
      />

      {/* ================= TABS ================= */}
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          const params = new URLSearchParams(searchParams);
          const tabParamMap: Record<string, string> = {
            "1": "banner",
            "2": "our_story",
            "3": "mission_vision",
            "4": "core_values",
          };
          params.set("tab", (tabParamMap[key] || key).toLowerCase());
          setSearchParams(params);
        }}
      >
        <TabPane tab="Banner" key="1">
          <Banner />
        </TabPane>

        <TabPane tab="Our Story" key="2">
          <OurStory />
        </TabPane>

        <TabPane tab="Mission & Vision" key="3">
          <MissionVision />
        </TabPane>

        <TabPane tab="Core Values" key="4">
          <CoreValues />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AboutContent;
