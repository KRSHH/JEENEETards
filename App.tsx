import React, { useState, useEffect, useMemo, ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { analysisData } from './services/data';
import type { AnalysisData } from './types';
import Card from './components/Card';
import { 
  PaginatedDataTableWithBars,
  TopItemsBarChart, 
  SlursBySubPieChart, 
  TemporalLineCharts,
  UserBreakdownInteractive,
  TimeSeriesChart,
  SlurDensityScatterPlot,
  InteractiveTargetList
} from './components/Charts';
import { FlameIcon, UsersIcon, TargetIcon, SubredditIcon, ClockIcon, ComboIcon, UserFocusIcon, ActivityIcon, TimelineIcon } from './components/Icons';
import loadingImage from './assets/loading.jpeg';

// StatCard component remains unchanged
const StatCard: React.FC<{
  icon: ReactNode;
  title: string;
  value: string;
  subValue: string;
}> = ({ icon, title, value, subValue }) => (
  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
    <div className="flex items-center text-slate-400 mb-2">{icon}<h3 className="text-sm font-medium ml-2">{title}</h3></div>
    <p className="text-2xl font-bold text-purple-400 mt-1 truncate w-full">{value}</p>
    <p className="text-xs text-slate-500">{subValue}</p>
  </div>
);

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const data: AnalysisData = analysisData;

  const isUserSpammy = (user: string): boolean => {
    const totalSlurs = data.user_total_slurs[user];
    const breakdown = data.user_slur_breakdown[user];
    if (!totalSlurs || !breakdown || totalSlurs === 0) return false;
    const maxSlurCount = Math.max(...Object.values(breakdown));
    return (maxSlurCount / totalSlurs) >= 0.9;
  };

  const topSlurs = useMemo(() => 
    Object.entries(data.slur_counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value), 
    [data.slur_counts]
  );

  const topUsers = useMemo(() =>
    Object.entries(data.user_total_slurs)
      .filter(([name]) => name !== 'padhle-bsdkk' && name !== 'Fish_fucker_70-1' && !isUserSpammy(name))
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10),
    [data.user_total_slurs, data.user_slur_breakdown]
  );

  const topTargets = useMemo(() =>
    Object.entries(data.insult_targets)
      .filter(([name]) => name !== '[deleted]' && name !== 'Katalagaaaa')
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value),
    [data.insult_targets]
  );

  const slursBySub = useMemo(() =>
    Object.entries(data.slurs_by_sub)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value),
    [data.slurs_by_sub]
  );
  
  const slursByDay = useMemo(() => {
    const dayMap = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return Object.entries(data.slurs_by_day).map(([day, value]) => ({ name: dayMap[parseInt(day, 10)], value }));
  }, [data.slurs_by_day]);

  const slursByHour = useMemo(() =>
    Object.entries(data.slurs_by_hour).map(([hour, value]) => ({ name: `${hour.padStart(2, '0')}:00`, value })),
    [data.slurs_by_hour]
  );

  const topCombos = useMemo(() =>
    Object.entries(data.slur_combos)
      .map(([name, value]) => ({ name: name.replace('|', ' + '), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10),
    [data.slur_combos]
  );

  const timeSeriesData = useMemo(() => {
    const counts: { [date: string]: number } = {};
    const startOf2021 = new Date('2021-01-01').getTime();
    data.time_series.forEach(ts => {
      if (ts * 1000 >= startOf2021) {
        const date = new Date(ts * 1000).toISOString().split('T')[0];
        counts[date] = (counts[date] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([date, value]) => ({ name: date, value })).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  }, [data.time_series]);

  const smoothedTimeSeriesData = useMemo(() => {
    const windowSize = 30;
    if (timeSeriesData.length < windowSize) return timeSeriesData;
    return timeSeriesData.map((_point, index, arr) => {
      const start = Math.max(0, index - windowSize + 1);
      const end = index + 1;
      const windowSlice = arr.slice(start, end);
      const sum = windowSlice.reduce((acc, curr) => acc + curr.value, 0);
      return { name: arr[index].name, value: Math.round(sum / windowSlice.length) };
    });
  }, [timeSeriesData]);

  // UPDATED: Now filters out the specific users AND spammy users from the scatter plot.
  const slurDensityData = useMemo(() => {
    const excludedUsers = ['padhle-bsdkk', 'Fish_fucker_70-1', 'JEENEETards-ModTeam'];
    return Object.keys(data.user_total_slurs)
      .filter(user => 
          !isUserSpammy(user) && 
          !excludedUsers.includes(user)
      )
      .map(user => ({ 
        user, 
        slurs: data.user_total_slurs[user], 
        activity: data.user_activity[user] || 1, 
        density: ((data.user_total_slurs[user] / (data.user_activity[user] || 1)) * 100).toFixed(2) 
      }))
      .sort((a, b) => b.activity - a.activity)
      .slice(0, 100);
  }, [data.user_total_slurs, data.user_activity, data.user_slur_breakdown]);

  const worstDay = useMemo(() => [...slursByDay].sort((a, b) => b.value - a.value)[0], [slursByDay]);
  const worstHour = useMemo(() => [...slursByHour].sort((a, b) => b.value - a.value)[0], [slursByHour]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen">
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-4 transition-all duration-700 ease-in-out ${isLoading ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="flex flex-col items-center gap-8"><div className="w-20 h-20 rounded-full border-8 border-slate-700 border-t-purple-400 animate-spin"></div><img src={loadingImage} alt="Loading Dashboard..." className="w-full max-w-sm h-auto rounded-lg shadow-2xl shadow-black/50" /></div>
      </div>
      <div className={`min-h-screen bg-slate-950 text-slate-200 p-4 sm:p-6 lg:p-8 transition-opacity duration-700 ease-in-out ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        <header className="mb-8 text-center"><h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">JEENEETards ke Topper bachche</h1><p className="text-slate-400 mt-2">*Madarchod</p></header>
        <section className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <StatCard icon={<UserFocusIcon />} title="Top Bachcha" value={topUsers[0]?.name || 'N/A'} subValue={`${(topUsers[0]?.value || 0).toLocaleString()} slurs`} />
          <StatCard icon={<FlameIcon />} title="Top Gaali" value={topSlurs[0]?.name || 'N/A'} subValue={`${(topSlurs[0]?.value || 0).toLocaleString()} uses`} />
          <StatCard icon={<ClockIcon />} title="Top Din" value={worstDay?.name || 'N/A'} subValue={`${(worstDay?.value || 0).toLocaleString()} slurs`} />
          <StatCard icon={<ActivityIcon />} title="Top Ghanta" value={worstHour?.name || 'N/A'} subValue={`${(worstHour?.value || 0).toLocaleString()} slurs`} />
        </section>
        <main className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          <div className="xl:col-span-2"><Card title="All Slurs Breakdown (by frequency)" icon={<FlameIcon />}><PaginatedDataTableWithBars data={topSlurs} /></Card></div>
          <Card title="Slurs by Subreddit" icon={<SubredditIcon />}><SlursBySubPieChart data={slursBySub} /></Card>
          <Card title="Top Users by Slur Count" icon={<UsersIcon />}><TopItemsBarChart data={topUsers} color="#82ca9d" /></Card>
          <Card title="Top Targeted Users" icon={<TargetIcon />}><InteractiveTargetList data={topTargets} color="#ffc658" /></Card>
          <div className="xl:col-span-2"><Card title="Temporal Patterns" icon={<ClockIcon />}><TemporalLineCharts byDay={slursByDay} byHour={slursByHour} /></Card></div>
          <Card title="Top Slur Combinations" icon={<ComboIcon />}><TopItemsBarChart data={topCombos} color="#ff8042" /></Card>
          <div className="md:col-span-2 xl:col-span-3 2xl:col-span-2"><Card title="User Slur Breakdown" icon={<UserFocusIcon />}><UserBreakdownInteractive data={data.user_slur_breakdown} userTotalSlurs={data.user_total_slurs} /></Card></div>
          <div className="md:col-span-2 xl:col-span-3 2xl:col-span-2"><Card title="Slur Usage Over Time (7-Day Average)" icon={<TimelineIcon />}><TimeSeriesChart data={smoothedTimeSeriesData} /></Card></div>
          <div className="md:col-span-2 xl:col-span-3 2xl:col-span-4"><Card title="User Activity vs Slur Count" icon={<ActivityIcon />}><SlurDensityScatterPlot data={slurDensityData} /></Card></div>
        </main>
        <footer className="text-center mt-8 text-slate-500 text-sm"><p>Made using every post, comment, reply ever made on r/JEENEETards</p></footer>
      </div>
      <Analytics />
    </div>
  );
};

export default App;