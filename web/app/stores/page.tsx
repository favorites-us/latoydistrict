import { indexMetadata } from '@/lib/navigation-content';
import BusinessIndexPage from '@/components/pages/BusinessIndexPage';
export const metadata = indexMetadata('en');
export default function Page() { return <BusinessIndexPage locale="en" />; }
