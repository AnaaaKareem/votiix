import React, { useState, useEffect } from 'react';
import {
  Users,
  Map,
  RotateCcw,
  CheckCircle2,
  Inbox
} from 'lucide-react';
import { api } from './config/api';

const ViewerLive = () => {
  const [electionResults, setElectionResults] = useState(null);
  const [committedVotes, setCommittedVotes] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const defaultElectionId = 'test-election'; // Using a consistent ID for testing

  const fetchData = async () => {
    try {
      setError(null);

      // Fetch results from API
      const resultsResponse = await api.get(`/public/elections/${defaultElectionId}/results`);
      const votesResponse = await api.get(`/public/elections/${defaultElectionId}/committed-votes`);

      setElectionResults(resultsResponse.data);
      setCommittedVotes(votesResponse.data);

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);

      // Provide fallback data structure without exposing sensitive details
      if (!electionResults) {
        setElectionResults({
          election: "General Election 2024",
          total_votes: 25055147,
          total_candidates: 3,
          contests: [
            {
              title: "Presidential Candidates",
              seats: null,
              candidates: [
                { id: 1, name: "Julian Sterling", party: "Conservative Alliance", percentage: 48.2, votes: 12450231 },
                { id: 2, name: "Elena Rodriguez", party: "Progressive Unity", percentage: 42.7, votes: 11042912 },
                { id: 3, name: "Marcus Thorne", party: "Libertarian Front", percentage: 6.1, votes: 1562004 }
              ]
            }
          ],
          turnout_percentage: 82.1,
          precincts_reporting: 88.4,
          reporting_units: {
            total: 12356,
            reporting: 10925
          }
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData();

    // Set up interval to poll data every 5 seconds
    const intervalId = setInterval(fetchData, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // Extract candidates from the results
  let candidates = [];
  let turnoutPercentage = '82.1';
  let precinctsReporting = '88.4';
  let totalVoters = '28,451,120';

  if (electionResults && electionResults.contests && electionResults.contests.length > 0) {
    candidates = electionResults.contests[0].candidates || [];
    turnoutPercentage = electionResults.turnout_percentage !== undefined ? electionResults.turnout_percentage : turnoutPercentage;
    precinctsReporting = electionResults.precincts_reporting !== undefined ? electionResults.precincts_reporting : precinctsReporting;

    // Format votes with commas
    candidates = candidates.map(candidate => ({
      ...candidate,
      display_votes: candidate.votes ? candidate.votes.toLocaleString() : '0',
      display_percent: candidate.percentage ? candidate.percentage.toFixed(1) : '0.0'
    }));
  } else {
    // Fallback candidates if no data
    candidates = [
      {
        id: 1,
        name: 'Julian Sterling',
        party: 'Conservative Alliance',
        display_percent: '48.2',
        display_votes: '12,450,231',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        avatar: 'bg-slate-800',
        iconColor: 'bg-slate-900',
        icon: 'inbox'
      },
      {
        id: 2,
        name: 'Elena Rodriguez',
        party: 'Progressive Unity',
        display_percent: '42.7',
        display_votes: '11,042,912',
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        avatar: 'bg-slate-700',
        iconColor: 'bg-blue-600',
        icon: 'users'
      },
      {
        id: 3,
        name: 'Marcus Thorne',
        party: 'Libertarian Front',
        display_percent: '6.1',
        display_votes: '1,562,004',
        color: 'text-slate-600',
        bg: 'bg-slate-100',
        avatar: 'bg-slate-200',
        iconColor: 'bg-slate-600',
        icon: 'inbox'
      }
    ];
  }

  // Helper to get proper icon component based on icon string
  const getIconComponent = (iconName) => {
    const iconMap = {
      'users': Users,
      'inbox': Inbox,
      'map': Map,
      'rotate': RotateCcw,
      'check': CheckCircle2
    };

    const IconComponent = iconMap[iconName] || Inbox;
    return <IconComponent />;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-2 mb-8">
        <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">National Aggregation</p>
        <h1 className="text-2xl font-bold text-slate-900">
          {electionResults?.election || 'General Election 2024'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error loading data. Showing cached/dummy data for demo.
        </div>
      )}


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {candidates.slice(0, 2).map((c, i) => {
                  const IconComponent = getIconComponent(c.icon);

                  // Derive colors and styles for this candidate based on index
                  const colorMap = [
                    {color: 'text-blue-600', bg: 'bg-blue-50', avatar: 'bg-slate-800', iconColor: 'bg-slate-900'},
                    {color: 'text-purple-600', bg: 'bg-purple-50', avatar: 'bg-slate-700', iconColor: 'bg-blue-600'}
                  ];

                  const style = colorMap[i] || {color: c.color, bg: c.bg, avatar: c.avatar, iconColor: c.iconColor};

                  return (
                    <div key={c.id || i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden h-56">
                        <Inbox className="w-48 h-48 absolute -top-8 -right-8 text-slate-50 opacity-50" />
                        <div className="relative z-10 space-y-2">
                            <p className="text-3xl font-black text-slate-900 tracking-tight">
                              {c.display_percent || c.percentage?.toFixed(1)} <span className="text-xl text-slate-400">%</span>
                            </p>
                            <p className={`text-sm font-bold tracking-widest uppercase ${style.color}`}>
                              {c.display_votes || c.votes?.toLocaleString() || '0'} VOTES
                            </p>
                        </div>
                        <div className="relative z-10 flex items-center justify-between mt-auto">
                            <div>
                                <p className="font-bold text-slate-900">{c.name}</p>
                                <p className="text-sm text-slate-500">{c.party}</p>
                            </div>
                            <div className="relative">
                                <div className={`w-16 h-16 rounded-lg ${style.avatar} flex items-center justify-center overflow-hidden`}>
                                    <div className="w-8 h-8 rounded-full bg-slate-400/20 mb-2" />
                                    <div className="w-12 h-6 rounded-t-full bg-slate-400/20 absolute bottom-0" />
                                </div>
                                <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded flex items-center justify-center text-white ${style.iconColor} shadow-sm border-2 border-white`}>
                                    <IconComponent className="w-3 h-3" />
                                </div>
                            </div>
                        </div>
                    </div>
                  );
                })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden h-56">
                    {candidates[2] ? (
                      <>
                        <div className="relative z-10 space-y-2">
                          <p className="text-2xl font-black text-slate-900 tracking-tight">
                            {candidates[2].display_percent || candidates[2].percentage?.toFixed(1)} <span className="text-lg text-slate-400">%</span>
                          </p>
                          <p className={`text-xs font-bold tracking-widest uppercase ${candidates[2].color || 'text-slate-600'}`}>
                            {candidates[2].display_votes || candidates[2].votes?.toLocaleString() || '0'} VOTES
                          </p>
                        </div>
                        <div className="relative z-10 flex items-center justify-between mt-auto">
                          <div>
                            <p className="font-bold text-slate-900">{candidates[2].name}</p>
                            <p className="text-sm text-slate-500">{candidates[2].party}</p>
                          </div>
                          <div className="relative">
                            <div className={`w-14 h-14 rounded-lg ${candidates[2].avatar || 'bg-slate-200'} flex items-center justify-center overflow-hidden`}>
                              <div className="w-6 h-6 rounded-full bg-slate-900 mb-2" />
                              <div className="w-10 h-5 rounded-t-full bg-slate-900 absolute bottom-0" />
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded flex items-center justify-center text-white ${candidates[2].iconColor || 'bg-slate-600'} shadow-sm border border-white`}>
                              <Inbox className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      // Render empty fallback if no third candidate
                      <>
                        <div className="relative z-10 space-y-2">
                          <p className="text-2xl font-black text-slate-900 tracking-tight">
                            0.0 <span className="text-lg text-slate-400">%</span>
                          </p>
                          <p className="text-xs font-bold tracking-widest uppercase text-slate-600">
                            0 VOTES
                          </p>
                        </div>
                        <div className="relative z-10 flex items-center justify-between mt-auto">
                          <div>
                            <p className="font-bold text-slate-900">No Data</p>
                            <p className="text-sm text-slate-500">None</p>
                          </div>
                          <div className="relative">
                            <div className="w-14 h-14 rounded-lg bg-slate-200 flex items-center justify-center">
                              <Inbox className="w-8 h-8 text-slate-400" />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                </div>

                <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-56">
                   <div className="space-y-4">
                        <p className="text-[10px] font-bold tracking-widest text-slate-900 uppercase">Reporting Progress</p>
                        <div>
                            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mb-2">
                                <div className="h-full bg-slate-900" style={{ width: `${precinctsReporting}%` }} />
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-slate-900">{precinctsReporting}%</span>
                                <span className="text-slate-400">Precincts</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1">Last Updated</p>
                        <p className="text-sm font-bold text-slate-900">
                          {lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col">
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h2 className="font-bold text-slate-900">Regional Distribution</h2>
                    <p className="text-sm text-slate-500">Interactive territory breakdown</p>
                </div>
                <Map className="w-5 h-5 text-blue-600" />
            </div>

            <div className="flex-1 relative flex items-center justify-center py-12">
                <div className="relative w-64 h-64">
                    <div className="absolute inset-0 bg-slate-200 clip-path-region opacity-50" style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }} />
                    <div className="absolute top-1/4 left-1/4 right-1/4 bottom-1/4 bg-blue-700 flex items-center justify-center shadow-xl clip-path-center" style={{ clipPath: 'polygon(10% 20%, 90% 10%, 100% 90%, 0% 100%)' }}>
                        <span className="text-white text-[10px] font-bold tracking-widest uppercase">Metro</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3 mt-auto pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-slate-900" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sterling Lead</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Rodriguez Lead</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pending</span>
                </div>
            </div>
        </div>
      </div>

      <div className="pt-8 mt-12 border-t border-slate-200 flex flex-wrap md:flex-nowrap items-center justify-between gap-6">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Registered Voters</p>
                <p className="text-lg font-bold text-slate-900">
                  {electionResults?.registered_voters ?
                    (electionResults.registered_voters).toLocaleString() :
                    '28,451,120'}
                </p>
            </div>
            <div className="space-y-1">
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Turnout Rate</p>
                <p className="text-lg font-bold text-blue-600">
                  {typeof turnoutPercentage === 'number' ? turnoutPercentage.toFixed(1) + '%' : turnoutPercentage + '%'}
                </p>
            </div>
            <div className="space-y-1">
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Status</p>
                <div className="flex items-center gap-2">
                    <div className={"w-2 h-2 rounded-full " + (error ? "bg-orange-500" : "bg-emerald-500")} />
                    <p className="text-sm font-bold text-slate-900">
                      {isLoading ? "Syncing" : error ? "Sync Interrupted" : "Secure Processing"}
                    </p>
                </div>
            </div>
        </div>
        <button
          className="bg-slate-900 hover:bg-black text-white p-4 rounded-xl shadow-lg transition-transform hover:scale-105"
          onClick={fetchData}
        >
            <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ViewerLive;