import React from 'react';
import { 
  Rocket, 
  TrendingUp, 
  Users, 
  Sparkles, 
  Flame, 
  Code2, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Presentation 
} from 'lucide-react';
import CommunityOrbit, { type OrbitItem, type OrbitStat, type OrbitTag } from './builders-community-hero';
import { getAssetUrl } from '@/utils/asset';

const items: OrbitItem[] = [
  // ==========================================
  // OUTER RING (Left to Right along the arc)
  // ==========================================
  { 
    kind: 'status', 
    ring: 'outer', 
    angle: 144, 
    label: 'Release shipped',
    hideOnMobile: true
  },
  { 
    kind: 'avatar', 
    ring: 'outer', 
    angle: 161, 
    mobileAngle: 160,
    src: getAssetUrl('avatars/user-left.jpg'), 
    alt: 'Lead Frontend Developer', 
    size: 68,
    statusDot: true
  },
  { 
    kind: 'badge', 
    ring: 'outer', 
    angle: 116, 
    mobileAngle: 120,
    icon: <Rocket size={20} className="text-blue-600" />, 
    iconBg: 'bg-blue-50/90',
    badge: '12', 
    badgeIcon: <TrendingUp size={11} strokeWidth={2.5} className="text-emerald-600" />,
    glow: 'rgba(37, 99, 235, 0.18)'
  },
  { 
    kind: 'pill', 
    ring: 'outer', 
    angle: 90, 
    mobileAngle: 90,
    icon: <Users size={14} strokeWidth={2.4} className="text-emerald-700" />, 
    label: '8 New Threads' 
  },
  { 
    kind: 'badge', 
    ring: 'outer', 
    angle: 65, 
    mobileAngle: 60,
    icon: <Flame size={19} className="fill-orange-500 text-orange-500" />, 
    iconBg: 'bg-orange-50/90',
    label: '240',
    glow: 'rgba(249, 115, 22, 0.18)'
  },
  { 
    kind: 'avatar', 
    ring: 'outer', 
    angle: 43, 
    mobileAngle: 20,
    src: getAssetUrl('avatars/user-right.jpg'), 
    alt: 'Senior Systems Architect', 
    size: 70,
    statusDot: true
  },
  { 
    kind: 'badge', 
    ring: 'outer', 
    angle: 24, 
    hideOnMobile: true,
    icon: <FileText size={17} className="text-blue-600" />, 
    iconBg: 'bg-blue-50/90',
    label: '36',
    glow: 'rgba(37, 99, 235, 0.15)'
  },

  // ==========================================
  // INNER RING (Left to Right along the arc)
  // ==========================================
  { 
    kind: 'badge', 
    ring: 'inner', 
    angle: 135, 
    mobileAngle: 140,
    icon: <Sparkles size={18} className="text-purple-600 fill-purple-100" />, 
    iconBg: 'bg-purple-50/90',
    label: '18',
    glow: 'rgba(147, 51, 234, 0.16)'
  },
  { 
    kind: 'avatar', 
    ring: 'inner', 
    angle: 90, 
    mobileAngle: 90,
    src: getAssetUrl('avatars/user-center.jpg'), 
    alt: 'VP of Engineering', 
    size: 76,
    statusDot: true
  },
  { 
    kind: 'badge', 
    ring: 'inner', 
    angle: 58, 
    hideOnMobile: true,
    icon: <Code2 size={19} strokeWidth={2.2} className="text-indigo-600" />, 
    iconBg: 'bg-indigo-50/90',
    glow: 'rgba(99, 102, 241, 0.16)'
  },
  { 
    kind: 'check', 
    ring: 'inner', 
    angle: 35,
    mobileAngle: 40
  },
];

const stats: OrbitStat[] = [
  { value: '12K+', label: 'Members' },
  { value: '340+', label: 'Projects' },
  { value: '2.5M+', label: 'Downloads' },
];

const tags: OrbitTag[] = [
  { icon: <Code2 strokeWidth={2} />, label: 'Open source', href: '#' },
  { icon: <Presentation strokeWidth={2} />, label: 'Weekly demos', href: '#' },
  { icon: <GraduationCap strokeWidth={2} />, label: 'Mentorship', href: '#' },
  { icon: <Briefcase strokeWidth={2} />, label: 'Job board', href: '#' },
];

export default function CommunityOrbitDemo() {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center bg-white" style={{ backgroundColor: '#ffffff' }}>
      <CommunityOrbit
        items={items}
        stats={stats}
        headline={
          <>
            Where Builders Ship
            <br className="hidden sm:block" /> Together
          </>
        }
        tags={tags}
      />
    </div>
  );
}
