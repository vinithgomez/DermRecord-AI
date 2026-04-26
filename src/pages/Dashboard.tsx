import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Users, FileText, BrainCircuit, Calendar, ArrowRight, Home } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { apiFetch } from "../lib/api";

export function Dashboard() {
  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const res = await apiFetch("/api/patients");
      if (!res.ok) throw new Error("Failed to fetch patients");
      return res.json();
    }
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const res = await apiFetch("/api/appointments");
      if (!res.ok) throw new Error("Failed to fetch appointments");
      return res.json();
    }
  });

  // Calculate Patient Growth Data
  const getGrowthData = () => {
    if (!patients) return [];
    
    const monthCounts: Record<string, number> = {};
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthYear = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthCounts[monthYear] = 0;
    }

    patients.forEach((p: any) => {
      const d = new Date(p.created_at);
      const monthYear = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (monthCounts[monthYear] !== undefined) {
        monthCounts[monthYear]++;
      }
    });

    let cumulative = 0;
    return Object.entries(monthCounts).map(([name, count]) => {
      cumulative += count;
      return { name, patients: cumulative };
    });
  };

  const growthData = getGrowthData();
  const recentPatients = patients?.slice(0, 5) || [];
  
  // Filter upcoming appointments (future dates)
  const upcomingAppointments = appointments?.filter((a: any) => new Date(a.appointment_date) >= new Date()) || [];

  if (patientsLoading || appointmentsLoading) {
    return <div className="p-8 text-center text-gray-500">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Link to="/">
          <Button variant="outline" size="sm" className="gap-2">
            <Home className="w-4 h-4" /> Back to Home
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Patients</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients?.length || 0}</div>
            <p className="text-xs text-gray-500">Registered in system</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Upcoming Appointments</CardTitle>
            <Calendar className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            <p className="text-xs text-gray-500">Scheduled for future</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">AI Extractions</CardTitle>
            <BrainCircuit className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-gray-500">NLP & RAG Operational</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">System Status</CardTitle>
            <Activity className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-gray-500">All services operational</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Growth Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Patient Growth</CardTitle>
            <CardDescription>Cumulative patient registrations over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="patients" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Next scheduled visits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.slice(0, 5).map((apt: any) => (
                  <div key={apt.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-sm text-gray-900">
                        {apt.patients?.first_name} {apt.patients?.last_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(apt.appointment_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                    </div>
                    <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {apt.status || 'Scheduled'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No upcoming appointments found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Patients */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Patients</CardTitle>
            <CardDescription>Latest registered patients in the system</CardDescription>
          </div>
          <Link to="/patients">
            <Button variant="outline" size="sm" className="gap-2">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Name</th>
                  <th className="px-4 py-3">Registered On</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3 rounded-tr-lg text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentPatients.map((patient: any) => (
                  <tr key={patient.id} className="border-b last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {patient.first_name} {patient.last_name}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(patient.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-500 capitalize">
                      {patient.gender}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/patients/${patient.id}`}>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                          View Record
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {recentPatients.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      No patients registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
