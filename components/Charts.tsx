import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import type { UserSlurBreakdown } from '../types';

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28', '#FF8042'];

interface ChartItem {
  name: string;
  value: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dataLabel = label || payload[0].name;
    return (<div className="bg-slate-850 p-2 border border-slate-700 rounded-md shadow-lg"><p className="label text-slate-200">{`${dataLabel}: ${payload[0].value.toLocaleString()}`}</p></div>);
  }
  return null;
};

export const TopItemsBarChart: React.FC<{data: ChartItem[], color: string}> = ({ data, color }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis type="number" stroke="#94a3b8" /><YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} tick={{ fontSize: 12 }} interval={0} /><Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.2)' }}/><Bar dataKey="value" fill={color} background={{ fill: '#1e293b' }} />
    </BarChart>
  </ResponsiveContainer>
);

export const PaginatedDataTableWithBars: React.FC<{data: ChartItem[]}> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  useEffect(() => { setCurrentPage(1); }, [data]);
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value), 0), [data]);
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-grow overflow-y-auto"><table className="w-full text-sm text-left text-slate-300"><thead className="text-xs text-slate-400 uppercase bg-slate-850 sticky top-0"><tr><th scope="col" className="px-4 py-2 w-16">#</th><th scope="col" className="px-4 py-2">Item</th><th scope="col" className="px-4 py-2 w-1/3">Frequency</th><th scope="col" className="px-4 py-2 text-right">Count</th></tr></thead><tbody>
      {paginatedData.map((item, index) => {
        const barWidth = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        return (<tr key={item.name} className="border-b border-slate-800 hover:bg-slate-800/50"><td className="px-4 py-2 font-mono text-slate-500">{startIndex + index + 1}</td><td className="px-4 py-2 font-medium">{item.name}</td><td className="px-4 py-2"><div className="w-full bg-slate-700/50 rounded-full h-2.5"><div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${barWidth}%` }}></div></div></td><td className="px-4 py-2 font-mono text-right">{item.value.toLocaleString()}</td></tr>);
      })}</tbody></table></div>
      {totalPages > 1 && (<div className="flex-shrink-0 flex justify-between items-center pt-3 text-sm text-slate-300"><button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">Prev</button><span>Page {currentPage} of {totalPages}</span><button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">Next</button></div>)}
    </div>
  );
};

// NEW: An interactive component for searching and viewing the ranked list of targeted users.
export const InteractiveTargetList: React.FC<{data: ChartItem[], color: string}> = ({ data, color }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 5;

  const rankedUsers = useMemo(() => data.map((user, index) => ({ ...user, rank: index + 1 })), [data]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return rankedUsers;
    return rankedUsers.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [rankedUsers, searchTerm]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const chartData = useMemo(() => filteredUsers.slice(0, 10), [filteredUsers]);

  return (
    <div className="flex flex-col md:flex-row h-full gap-4">
      <div className="md:w-2/5 flex flex-col">
        <input type="text" placeholder="Search target..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 placeholder-slate-500" />
        <ul className="bg-slate-850 rounded-md p-2 mt-2 space-y-1">
          {paginatedUsers.map(({ name, rank, value }) => (
            <li key={name} className="p-2 rounded-md flex items-center justify-between text-sm">
              <div className="flex items-center truncate">
                <span className="text-slate-400 font-mono mr-3 text-right w-8 shrink-0">#{rank}</span>
                <span className="truncate font-medium">{name}</span>
              </div>
              <span className="font-mono text-slate-500 shrink-0 ml-2">{value.toLocaleString()}</span>
            </li>
          ))}
        </ul>
        {totalPages > 1 && (<div className="flex justify-between items-center mt-2 text-sm text-slate-300"><button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">Prev</button><span>Page {currentPage} of {totalPages}</span><button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">Next</button></div>)}
      </div>
      <div className="md:w-3/5 h-80 md:h-full">
        <TopItemsBarChart data={chartData} color={color} />
      </div>
    </div>
  );
};

export const SlursBySubPieChart: React.FC<{data: ChartItem[]}> = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%"><PieChart><Tooltip content={<CustomTooltip />} /><Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={'80%'} fill="#8884d8" labelLine={false} label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}>{data.map((entry, index) => (<Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />))}</Pie></PieChart></ResponsiveContainer>
);

export const TemporalLineCharts: React.FC<{byDay: ChartItem[], byHour: ChartItem[]}> = ({ byDay, byHour }) => (
    <div className='w-full h-full flex flex-col'>
        <div className="h-1/2"><ResponsiveContainer width="100%" height="100%"><LineChart data={byDay} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="name" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip content={<CustomTooltip />} /><Legend formatter={() => 'By Day of Week'}/><Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} /></LineChart></ResponsiveContainer></div>
        <div className="h-1/2"><ResponsiveContainer width="100%" height="100%"><LineChart data={byHour} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} interval={3} /><YAxis stroke="#94a3b8" /><Tooltip content={<CustomTooltip />} /><Legend formatter={() => 'By Hour of Day (UTC)'} /><Line type="monotone" dataKey="value" stroke="#82ca9d" activeDot={{ r: 8 }} /></LineChart></ResponsiveContainer></div>
    </div>
);

export const UserBreakdownInteractive: React.FC<{data: UserSlurBreakdown, userTotalSlurs: { [key: string]: number }}> = ({ data, userTotalSlurs }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const USERS_PER_PAGE = 5;

    const rankedUsers = useMemo(() => {
        return Object.keys(data)
            .filter(user => {
                if (user === 'padhle-bsdkk' || user === 'Fish_fucker_70-1' || user === 'JEENEETards-ModTeam') return false;
                const totalSlurs = userTotalSlurs[user];
                const breakdown = data[user];
                if (!totalSlurs || !breakdown || totalSlurs === 0) return true;
                const maxSlurCount = Math.max(...Object.values(breakdown));
                return (maxSlurCount / totalSlurs) < 0.9;
            })
            .sort((a, b) => (userTotalSlurs[b] || 0) - (userTotalSlurs[a] || 0) || a.localeCompare(b))
            .map((user, index) => ({ name: user, rank: index + 1 }));
    }, [data, userTotalSlurs]);

    useEffect(() => {
        if (rankedUsers.length > 0) {
            const isSelectedUserVisible = rankedUsers.some(u => u.name === selectedUser);
            if (!selectedUser || !isSelectedUserVisible) setSelectedUser(rankedUsers[0].name);
        } else { setSelectedUser(null); }
    }, [rankedUsers, selectedUser]);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return rankedUsers;
        return rankedUsers.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [rankedUsers, searchTerm]);

    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * USERS_PER_PAGE;
        return filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    const selectedUserData = useMemo(() => {
        if (!selectedUser) return [];
        return Object.entries(data[selectedUser]).map(([name, value]) => ({ name, value: Number(value) })).sort((a, b) => b.value - a.value);
    }, [selectedUser, data]);

    return (
        <div className="flex flex-col md:flex-row h-full gap-4">
            <div className="md:w-1/3 flex flex-col">
                <input type="text" placeholder="Search user..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 placeholder-slate-500" />
                <ul className="bg-slate-850 rounded-md p-2 mt-2">
                    {paginatedUsers.map(({ name, rank }) => (<li key={name} onClick={() => setSelectedUser(name)} className={`p-2 rounded-md cursor-pointer flex items-center ${selectedUser === name ? 'bg-purple-600' : 'hover:bg-slate-700'}`}><span className="text-slate-400 font-mono mr-3 text-right w-12 shrink-0">#{rank}</span><span className="truncate">{name}</span></li>))}
                </ul>
                {totalPages > 1 && (<div className="flex justify-between items-center mt-2 text-sm text-slate-300"><button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">Prev</button><span>Page {currentPage} of {totalPages}</span><button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">Next</button></div>)}
            </div>
            <div className="md:w-2/3 h-80 md:h-full">
                {selectedUserData.length > 0 ? (<PaginatedDataTableWithBars data={selectedUserData} />) : (<div className="flex items-center justify-center h-full text-slate-500"><p>{selectedUser ? "This user has no recorded slurs." : "Select a user to see their slur breakdown."}</p></div>)}
            </div>
        </div>
    );
};

export const TimeSeriesChart: React.FC<{data: ChartItem[]}> = ({ data }) => (
    <ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} minTickGap={30} /><YAxis stroke="#94a3b8" /><Tooltip content={<CustomTooltip />} /><Legend /><Line type="monotone" dataKey="value" name="7-Day Average" stroke="#ff7300" dot={false} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer>
);

export const SlurDensityScatterPlot: React.FC<{data: { user: string; slurs: number; activity: number; density: string; }[]}> = ({ data }) => {
    const domain = [0, Math.max(...data.map(d => d.activity))];
    const range = [0, Math.max(...data.map(d => d.slurs))];
    return (<ResponsiveContainer width="100%" height="100%"><ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20, }}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis type="number" dataKey="activity" name="Total Activity" unit="" stroke="#94a3b8" domain={domain} tickFormatter={(tick) => tick.toLocaleString()} /><YAxis type="number" dataKey="slurs" name="Total Slurs" unit="" stroke="#94a3b8" domain={range} tickFormatter={(tick) => tick.toLocaleString()}/><ZAxis type="number" dataKey="slurs" range={[50, 500]} name="slur count" /><Tooltip cursor={{ strokeDasharray: '3 3' }} content={ScatterTooltip} /><Legend /><Scatter name="Users" data={data} fill="#8884d8" shape="circle" /></ScatterChart></ResponsiveContainer>);
};

const ScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (<div className="bg-slate-850 p-3 border border-slate-700 rounded-md shadow-lg text-sm"><p className="font-bold text-slate-100">{data.user}</p><p className="text-slate-300">Total Activity: {data.activity.toLocaleString()}</p><p className="text-slate-300">Total Slurs: {data.slurs.toLocaleString()}</p><p className="text-slate-300">Density: {data.density}%</p></div>);
    }
    return null;
};