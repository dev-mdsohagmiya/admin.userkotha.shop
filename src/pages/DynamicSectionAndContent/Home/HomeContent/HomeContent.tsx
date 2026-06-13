"use client";

import { useEffect, useState } from "react";
import { Tabs } from "antd";
import TabPane from "antd/es/tabs/TabPane";
import { useSearchParams } from "react-router-dom";

import PageMeta from "../../../../components/common/Meta/PageMeta";
import PageHeader from "../../../../components/common/Navigation/PageHeader";

import TypeWiseHomeSection from "../TypeWiseHomeSection/TypeWiseHomeSection";

import CreateHotDealModal from "../../../../components/common/Modals/HotDeals/CreateHotDealModal";
import HeroBanner from "../HeroBanner/HeroBanner";
import WhyChooseUs from "../WhyChooseUs/WhyChooseUs";
import Report from "../Report/Report";
import Video from "../Video/Video";
import SpecialBenefits from "../SpecialBenefits/SpecialBenefits";

const HomeContent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [openModal, setOpenModal] = useState<"hero" | "deal" | null>(null);
  const [activeTab, setActiveTab] = useState("1");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (!tabParam) return;

    const normalized = tabParam.toLowerCase();
    const tabMap: Record<string, string> = {
      "product section": "1",
      product_section: "1",
      "hero banner": "2",
      hero_banner: "2",
      "why choose us": "4",
      why_choose_us: "4",
      report: "5",
      video: "6",
      "social benefits": "7",
      social_benefits: "7",
    };
    const nextTab = tabMap[normalized];
    if (nextTab && nextTab !== activeTab) {
      setActiveTab(nextTab);
    }
  }, [activeTab, searchParams]);

  return (
    <div>
      <PageMeta
        title="Home Section | UserKotha.Shop ERP"
        description="Manage home content"
      />

      <PageHeader
        title="Home Section"
        subtitle="View and manage all Home Section"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Home Section" },
        ]}
        extra={null}
      />

      {/* ================= TABS ================= */}
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          const params = new URLSearchParams(searchParams);
          const tabParamMap: Record<string, string> = {
            "1": "product_section",
            "2": "hero_banner",
            "4": "why_choose_us",
            "5": "report",
            "6": "video",
            "7": "social_benefits",
          };
          params.set("tab", (tabParamMap[key] || key).toLowerCase());
          setSearchParams(params);
        }}
      >
        <TabPane tab="Product Section" key="1">
          <TypeWiseHomeSection />
        </TabPane>

        <TabPane tab="Hero Banner" key="2">
          <HeroBanner />
        </TabPane>

        <TabPane tab="Why Choose Us" key="4">
          <WhyChooseUs />
        </TabPane>
        <TabPane tab="Report" key="5">
          <Report />
        </TabPane>
        <TabPane tab="Video" key="6">
          <Video />
        </TabPane>
        <TabPane tab="Social Benefits" key="7">
          <SpecialBenefits />
        </TabPane>
      </Tabs>

      {/* ================= MODALS ================= */}
      {openModal === "hero" && (
        <CreateHotDealModal open={true} setOpen={() => setOpenModal(null)} />
      )}
    </div>
  );
};

export default HomeContent;
