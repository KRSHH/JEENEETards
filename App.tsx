
import React, { useMemo } from 'react';
import { analysisData } from './services/data';
import type { AnalysisData } from './types';
import Card from './components/Card';
import { 
  TopItemsBarChart, 
  SlursBySubPieChart, 
  TemporalLineCharts,
  UserBreakdownInteractive,
  TimeSeriesChart,
  SlurDensityScatterPlot
} from './components/Charts';
import { FlameIcon, UsersIcon, TargetIcon, SubredditIcon, ClockIcon, ComboIcon, UserFocusIcon, ActivityIcon, TimelineIcon } from './components/Icons';

const App: React.FC = () => {
  const data: AnalysisData = analysisData;

  const topSlurs = useMemo(() => 
    Object.entries(data.slur_counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10), 
    [data.slur_counts]
  );

  const topUsers = useMemo(() =>
    Object.entries(data.user_total_slurs)
      .filter(([name]) => name !== 'IYeetDragons') // Filter out IYeetDragons
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10),
    [data.user_total_slurs]
  );

  const topTargets = useMemo(() =>
    Object.entries(data.insult_targets)
      .filter(([name]) => name !== '[deleted]' && name !== 'Katalagaaaa') // Filter out [deleted] and Katalagaaaa
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10),
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
    return Object.entries(data.slurs_by_day).map(([day, value]) => ({
      name: dayMap[parseInt(day, 10)],
      value,
    }));
  }, [data.slurs_by_day]);

  const slursByHour = useMemo(() =>
    Object.entries(data.slurs_by_hour).map(([hour, value]) => ({
      name: `${hour.padStart(2, '0')}:00`,
      value,
    })),
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
    const startOf2023 = new Date('2023-01-01').getTime();
    
    data.time_series.forEach(ts => {
      // Only include timestamps from 2023 onwards
      if (ts * 1000 >= startOf2023) {
        const date = new Date(ts * 1000).toISOString().split('T')[0];
        counts[date] = (counts[date] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([date, value]) => ({ name: date, value }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  }, [data.time_series]);

  const slurDensityData = useMemo(() => {
    return Object.keys(data.user_total_slurs).map(user => ({
      user,
      slurs: data.user_total_slurs[user],
      activity: data.user_activity[user] || 1, // Avoid division by zero
      density: ((data.user_total_slurs[user] / (data.user_activity[user] || 1)) * 100).toFixed(2)
    })).sort((a, b) => b.activity - a.activity).slice(0, 100); // Top 100 by activity
  }, [data.user_total_slurs, data.user_activity]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 sm:p-6 lg:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
          Slur Analysis Dashboard
        </h1>
        <p className="text-slate-400 mt-2">Comprehensive Visualization of Usage Patterns</p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        <div className="xl:col-span-2">
            <Card title="Top Slurs Used" icon={<FlameIcon />}>
                <TopItemsBarChart data={topSlurs} color="#8884d8" />
            </Card>
        </div>
        
        <Card title="Slurs by Subreddit" icon={<SubredditIcon />}>
            <SlursBySubPieChart data={slursBySub} />
        </Card>

        <Card title="Top Users by Slur Count" icon={<UsersIcon />}>
            <TopItemsBarChart data={topUsers} color="#82ca9d" />
        </Card>

        <Card title="Top Targeted Users" icon={<TargetIcon />}>
            <TopItemsBarChart data={topTargets} color="#ffc658" />
        </Card>

        <div className="xl:col-span-2">
            <Card title="Temporal Patterns" icon={<ClockIcon />}>
                <TemporalLineCharts byDay={slursByDay} byHour={slursByHour} />
            </Card>
        </div>

        <Card title="Top Slur Combinations" icon={<ComboIcon />}>
            <TopItemsBarChart data={topCombos} color="#ff8042" />
        </Card>

        <div className="md:col-span-2 xl:col-span-3 2xl:col-span-2">
            <Card title="User Slur Breakdown" icon={<UserFocusIcon />}>
                <UserBreakdownInteractive data={data.user_slur_breakdown} userTotalSlurs={data.user_total_slurs} />
            </Card>
        </div>
        
        <div className="md:col-span-2 xl:col-span-3 2xl:col-span-2">
            <Card title="Slur Usage Over Time" icon={<TimelineIcon />}>
                <TimeSeriesChart data={timeSeriesData} />
            </Card>
        </div>
        
        <div className="md:col-span-2 xl:col-span-3 2xl:col-span-4">
             <Card title="User Activity vs Slur Count" icon={<ActivityIcon />}>
                <SlurDensityScatterPlot data={slurDensityData} />
            </Card>
        </div>

      </main>
       <footer className="text-center mt-8 text-slate-500 text-sm">
        <p>Powered by React, Tailwind CSS, and Recharts.</p>
      </footer>
    </div>
  );
};

export default App;
