import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Users, UserPlus, Search, Plus, Trash2, Mail, Shield, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: string;
  added_at: string;
}

interface Team {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
  members: TeamMember[];
}

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isUser, setIsUser] = useState(false);
  const [createTeamDialogOpen, setCreateTeamDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const authenticated = !!data.session?.user;
      setIsUser(authenticated);
      
      if (authenticated) {
        setUserData(data.session.user);
        console.log("Authenticated user:", data.session.user);
        
        // Check if user is admin
        const adminAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
        setIsAdmin(adminAuthenticated);
        
        if (adminAuthenticated) {
          // Fetch teams created by this admin
          fetchTeams();
        }
      }
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsUser(!!session?.user);
      setUserData(session?.user || null);
      
      const adminAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
      setIsAdmin(adminAuthenticated);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fetch teams from Supabase
  const fetchTeams = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, you would fetch teams from Supabase
      // For now, we'll use mock data
      const mockTeams: Team[] = [
        {
          id: "1",
          name: "Marketing Team",
          created_at: new Date().toISOString(),
          created_by: userData?.id || "",
          members: [
            { id: "101", email: "john@example.com", name: "John Doe", role: "team_member", added_at: new Date().toISOString() },
            { id: "102", email: "jane@example.com", name: "Jane Smith", role: "team_member", added_at: new Date().toISOString() }
          ]
        },
        {
          id: "2",
          name: "Development Team",
          created_at: new Date().toISOString(),
          created_by: userData?.id || "",
          members: [
            { id: "103", email: "bob@example.com", name: "Bob Johnson", role: "team_member", added_at: new Date().toISOString() }
          ]
        }
      ];
      
      setTeams(mockTeams);
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new team
  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      setErrors({ teamName: "Team name is required" });
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      // In a real implementation, you would create a team in Supabase
      // For now, we'll simulate it
      const newTeam: Team = {
        id: Date.now().toString(),
        name: newTeamName,
        created_at: new Date().toISOString(),
        created_by: userData?.id || "",
        members: []
      };
      
      setTeams([...teams, newTeam]);
      setNewTeamName("");
      setCreateTeamDialogOpen(false);
    } catch (error) {
      console.error("Error creating team:", error);
      setErrors({ general: "Failed to create team. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Add a member to a team
  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      setErrors({ memberEmail: "Email is required" });
      return;
    }
    
    if (!selectedTeam) {
      setErrors({ general: "No team selected" });
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      // In a real implementation, you would add a member to a team in Supabase
      // For now, we'll simulate it
      const newMember: TeamMember = {
        id: Date.now().toString(),
        email: newMemberEmail,
        name: newMemberEmail.split('@')[0], // Simple name extraction from email
        role: "team_member",
        added_at: new Date().toISOString()
      };
      
      const updatedTeams = teams.map(team => {
        if (team.id === selectedTeam.id) {
          return {
            ...team,
            members: [...team.members, newMember]
          };
        }
        return team;
      });
      
      setTeams(updatedTeams);
      setNewMemberEmail("");
      setAddMemberDialogOpen(false);
    } catch (error) {
      console.error("Error adding team member:", error);
      setErrors({ general: "Failed to add team member. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove a member from a team
  const handleRemoveMember = async (teamId: string, memberId: string) => {
    setIsLoading(true);
    
    try {
      // In a real implementation, you would remove a member from a team in Supabase
      // For now, we'll simulate it
      const updatedTeams = teams.map(team => {
        if (team.id === teamId) {
          return {
            ...team,
            members: team.members.filter(member => member.id !== memberId)
          };
        }
        return team;
      });
      
      setTeams(updatedTeams);
    } catch (error) {
      console.error("Error removing team member:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // If not admin, show access restricted
  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Admin Access Required</h2>
            <p className="text-muted-foreground mb-6">You need admin privileges to manage teams.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => window.history.back()}>
                Go Back
              </Button>
              <Button variant="default" onClick={() => navigate("/")}>
                Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* User Info Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{userData?.email}</h3>
              <div className="flex items-center">
                <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
                  <Shield className="w-3 h-3 mr-1" /> Admin
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">Create and manage teams to share documents with team members.</p>
        </div>
        <Button onClick={() => setCreateTeamDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Team
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search teams..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Teams List */}
      {teams.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Teams Created</h3>
            <p className="text-muted-foreground mb-4">Create your first team to start sharing documents.</p>
            <Button onClick={() => setCreateTeamDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {teams
            .filter(team => team.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(team => (
              <Card key={team.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{team.name}</CardTitle>
                      <CardDescription>
                        Created {new Date(team.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedTeam(team);
                        setAddMemberDialogOpen(true);
                      }}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Member
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Added</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {team.members.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                              No team members yet
                            </TableCell>
                          </TableRow>
                        ) : (
                          team.members.map(member => (
                            <TableRow key={member.id}>
                              <TableCell>{member.name}</TableCell>
                              <TableCell>{member.email}</TableCell>
                              <TableCell>{new Date(member.added_at).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveMember(team.id, member.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Create Team Dialog */}
      <Dialog open={createTeamDialogOpen} onOpenChange={setCreateTeamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Create a team to share documents with team members.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                placeholder="Enter team name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
              {errors.teamName && (
                <p className="text-sm text-destructive">{errors.teamName}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateTeamDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTeam} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Team"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a team member to {selectedTeam?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="member-email">Email Address</Label>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="member-email"
                  placeholder="Enter email address"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                />
              </div>
              {errors.memberEmail && (
                <p className="text-sm text-destructive">{errors.memberEmail}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMemberDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddMember} disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}