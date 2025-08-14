
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Sector,
  LineChart, Line,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import type { UserSlurBreakdown } from '../types';

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28', '#FF8042'];
const RADIAN = Math.PI / 180;

interface ChartItem {
  name: string;
  value: number;
}

interface TopItemsBarChartProps {
  data: ChartItem[];
  color: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-850 p-2 border border-slate-700 rounded-md shadow-lg">
        <p className="label text-slate-200">{`${label} : ${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};


export const TopItemsBarChart: React.FC<TopItemsBarChartProps> = ({ data, color }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
      <XAxis type="number" stroke="#94a3b8" />
      <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} tick={{ fontSize: 12 }} />
      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.2)' }}/>
      <Bar dataKey="value" fill={color} background={{ fill: '#1e293b' }} />
    </BarChart>
  </ResponsiveContainer>
);

interface SlursBySubPieChartProps {
  data: ChartItem[];
}

export const SlursBySubPieChart: React.FC<SlursBySubPieChartProps> = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Tooltip content={<CustomTooltip />} />
      <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={'80%'} fill="#8884d8" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
        ))}
      </Pie>
    </PieChart>
  </ResponsiveContainer>
);

interface TemporalLineChartsProps {
    byDay: ChartItem[];
    byHour: ChartItem[];
}

export const TemporalLineCharts: React.FC<TemporalLineChartsProps> = ({ byDay, byHour }) => (
    <div className='w-full h-full flex flex-col'>
        <div className="h-1/2">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={byDay} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend formatter={() => 'By Day of Week'}/>
                    <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
        <div className="h-1/2">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={byHour} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} interval={3} />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend formatter={() => 'By Hour of Day (UTC)'} />
                    <Line type="monotone" dataKey="value" stroke="#82ca9d" activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
);


interface UserBreakdownInteractiveProps {
    data: UserSlurBreakdown;
    userTotalSlurs: { [key: string]: number };
}

export const UserBreakdownInteractive: React.FC<UserBreakdownInteractiveProps> = ({ data, userTotalSlurs }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<string | null>(null);

    const users = useMemo(() => {
        // Sort by total slur count (descending), then alphabetically for users with same count
        return Object.keys(data)
            .filter(user => user !== 'IYeetDragons') // Filter out IYeetDragons
            .sort((a, b) => {
                const aCount = Number(userTotalSlurs[a]) || 0;
                const bCount = Number(userTotalSlurs[b]) || 0;
                if (aCount !== bCount) {
                    return bCount - aCount; // Descending order
                }
                return a.localeCompare(b); // Alphabetical for same counts
            });
    }, [data, userTotalSlurs]);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) {
            return users; // Return sorted by slur count when no search
        }
        // When searching, filter and sort alphabetically
        return users
            .filter(user => user.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort();
    }, [users, searchTerm]);

    const selectedUserData = useMemo(() => {
        if (!selectedUser) return null;
        return Object.entries(data[selectedUser])
            .map(([name, value]) => ({ name, value: Number(value) }))
            .sort((a, b) => b.value - a.value);
    }, [selectedUser, data]);

    return (
        <div className="flex flex-col md:flex-row h-full gap-4">
            <div className="md:w-1/3 flex flex-col">
                <input
                    type="text"
                    placeholder="Search user..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md mb-2 text-slate-200 placeholder-slate-500"
                />
                <ul className="flex-grow overflow-y-auto bg-slate-850 rounded-md p-2">
                    {filteredUsers.map(user => (
                        <li key={user}
                            onClick={() => setSelectedUser(user)}
                            className={`p-2 rounded-md cursor-pointer truncate ${selectedUser === user ? 'bg-purple-600' : 'hover:bg-slate-700'}`}>
                            {user}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="md:w-2/3 h-full">
                {selectedUserData ? (
                    <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Tooltip content={<CustomTooltip />} />
                            <Pie data={selectedUserData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={'50%'} outerRadius={'80%'} fill="#8884d8" paddingAngle={5} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                                {selectedUserData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">
                        <p>Select a user to see their slur breakdown.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

interface TimeSeriesChartProps {
    data: ChartItem[];
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ data }) => (
    <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} minTickGap={30} />
            <YAxis stroke="#94a3b8" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="value" name="Slurs per Day" stroke="#ff7300" dot={false} activeDot={{ r: 6 }} />
        </LineChart>
    </ResponsiveContainer>
);


interface ScatterPlotData {
    user: string;
    slurs: number;
    activity: number;
    density: string;
}

interface SlurDensityScatterPlotProps {
    data: ScatterPlotData[];
}

const ScatterTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-850 p-3 border border-slate-700 rounded-md shadow-lg text-sm">
        <p className="font-bold text-slate-100">{data.user}</p>
        <p className="text-slate-300">Total Activity: {data.activity.toLocaleString()}</p>
        <p className="text-slate-300">Total Slurs: {data.slurs.toLocaleString()}</p>
        <p className="text-slate-300">Density: {data.density}%</p>
      </div>
    );
  }
  return null;
};

export const SlurDensityScatterPlot: React.FC<SlurDensityScatterPlotProps> = ({ data }) => {
    const domain = [0, Math.max(...data.map(d => d.activity))];
    const range = [0, Math.max(...data.map(d => d.slurs))];
    
    return (
        <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20, }}>
                <CartesianGrid stroke="#334155" />
                <XAxis type="number" dataKey="activity" name="Total Activity" unit="" stroke="#94a3b8" domain={domain} tickFormatter={(tick) => tick.toLocaleString()} />
                <YAxis type="number" dataKey="slurs" name="Total Slurs" unit="" stroke="#94a3b8" domain={range} tickFormatter={(tick) => tick.toLocaleString()}/>
                <ZAxis type="number" dataKey="slurs" range={[50, 500]} name="slur count" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<ScatterTooltip />} />
                <Legend />
                <Scatter name="Users" data={data} fill="#8884d8" shape="circle" />
            </ScatterChart>
        </ResponsiveContainer>
    );
};
