import { Hero } from "@/components/home/hero";
import { CurrentMonth } from "@/components/home/current-month";
import { LatestAnnouncement } from "@/components/home/latest-announcement";
import { StatusTracker } from "@/components/home/status-tracker";
import { ReportCta } from "@/components/home/report-cta";
import { Regions } from "@/components/home/regions";
import { HowItWorks } from "@/components/home/how-it-works";
import { RecentAnnouncements } from "@/components/home/recent-announcements";
import { CommitteePreview } from "@/components/home/committee-preview";
import { CalendarPreview } from "@/components/home/calendar-preview";
import { MediaPreview } from "@/components/home/media-preview";
import { Newsletter } from "@/components/home/newsletter";

export default function Home() {
  return (
    <>
      <Hero />
      <CurrentMonth />
      <LatestAnnouncement />
      <StatusTracker />
      <ReportCta />
      <Regions />
      <HowItWorks />
      <RecentAnnouncements />
      <CommitteePreview />
      <CalendarPreview />
      <MediaPreview />
      <Newsletter />
    </>
  );
}
