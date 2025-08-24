import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { debugCurrentUser, debugAllUsers } from "@/utils/debug";
import { verifyDatabaseSetup, fixCurrentUserProfile } from "@/utils/database-check";
import { 
  Upload, 
  FileText, 
  Trash2, 
  Eye,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Cloud,
  Activity,
  Download,
  User,
  UserPlus,
  Users,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  filename: string;
  fileSize: number;
  uploadDate: Date;
  status: "processing" | "ready" | "error";
  uploadedBy: string;
  teamId?: string;
  teamName?: string;
}

export default function Admin() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | undefined>(undefined);
  const [filterByTeam, setFilterByTeam] = useState<string | undefined>(undefined);

  // Workflow state for admin
  const [currentWorkingTeam, setCurrentWorkingTeamState] = useState<string | undefined>(() => {
    // Try to restore from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('currentWorkingTeam') || undefined;
    }
    return undefined;
  });
  
  // Wrapper function to persist team selection
  const setCurrentWorkingTeam = (teamId: string | null | undefined) => {
    if (typeof window !== 'undefined') {
      if (teamId) {
        localStorage.setItem('currentWorkingTeam', teamId);
      } else {
        localStorage.removeItem('currentWorkingTeam');
      }
    }
    setCurrentWorkingTeamState(teamId || undefined);
  };
  
  const [workflowStep, setWorkflowStep] = useState<'select_team' | 'manage_team'>('select_team');

  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  
  // Team member management states
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberTeam, setNewMemberTeam] = useState<string | undefined>(undefined);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [searchedUsers, setSearchedUsers] = useState<any[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  
  // Team management states
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");

  // Check if user is admin or regular user
  const isAdmin = localStorage.getItem('adminAuthenticated') === 'true';
  const [isUser, setIsUser] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [userTeams, setUserTeams] = useState<string[]>([]);
  
  // Fetch documents from Supabase
  const fetchDocuments = async () => {
    if (!userData) {
      console.log("No userData available, skipping fetchDocuments");
      return;
    }
    
    try {
      if (isAdmin) {
        // Admin can see all documents
        const { data: allDocuments, error } = await supabase
          .from('documents')
          .select(`
            *,
            teams(id, name)
          `)
          .order('upload_date', { ascending: false });
          
        if (error) {
          console.error("Error fetching documents for admin:", error);
          return;
        }
        
        // Transform data for UI
        const transformedDocs: Document[] = allDocuments?.map((doc: any) => ({
          id: doc.id,
          filename: doc.filename,
          fileSize: doc.file_size,
          uploadDate: new Date(doc.upload_date),
          status: doc.status as Document['status'],
          uploadedBy: "Admin", // You could join with profiles table to get actual user
          teamId: doc.team_id,
          teamName: doc.teams?.name || 'No Team'
        })) || [];
        
        setDocuments(transformedDocs);
        console.log("Admin documents fetched:", transformedDocs);
        
      } else {
        // Regular users see documents from their teams
        if (userTeams.length === 0) {
          console.log("User not in any teams, no documents to show");
          setDocuments([]);
          return;
        }
        
        const { data: teamDocuments, error } = await supabase
          .from('documents')
          .select(`
            *,
            teams(id, name)
          `)
          .in('team_id', userTeams)
          .order('upload_date', { ascending: false });
          
        if (error) {
          console.error("Error fetching documents for user:", error);
          return;
        }
        
        // Transform data for UI
        const transformedDocs: Document[] = teamDocuments?.map((doc: any) => ({
          id: doc.id,
          filename: doc.filename,
          fileSize: doc.file_size,
          uploadDate: new Date(doc.upload_date),
          status: doc.status as Document['status'],
          uploadedBy: "Team Member", // You could join with profiles table to get actual user
          teamId: doc.team_id,
          teamName: doc.teams?.name || 'No Team'
        })) || [];
        
        setDocuments(transformedDocs);
        console.log("User documents fetched:", transformedDocs);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };
  
  // Fetch teams from Supabase
  const fetchTeams = async () => {
    if (!userData) {
      console.log("No userData available, skipping fetchTeams");
      return;
    }
    
    try {
      if (isAdmin) {
        // Admin can see all teams they created
        const { data: teams, error } = await supabase
          .from('teams')
          .select('*')
          .eq('created_by', userData.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Error fetching teams:", error);
          // Fallback to mock data if database isn't set up
          const mockTeams = [
            { id: "1", name: "Marketing Team", created_by: userData?.id || "", created_at: new Date().toISOString() },
            { id: "2", name: "Development Team", created_by: userData?.id || "", created_at: new Date().toISOString() },
          ];
          setTeams(mockTeams);
        } else {
          setTeams(teams || []);
          console.log("Teams fetched:", teams);
        }
      } else {
        // Regular users can see teams they belong to
        const { data: teamMemberships, error } = await supabase
          .from('team_members')
          .select('teams!inner(id, name)')
          .eq('user_id', userData.id);
          
        if (error) {
          console.error("Error fetching user teams:", error);
          setUserTeams([]);
          setTeams([]);
        } else {
          console.log("Raw team memberships:", teamMemberships);
          const userTeamIds = teamMemberships?.map((tm: any) => tm.teams?.id).filter(Boolean) || [];
          const teamsList = teamMemberships?.map((tm: any) => tm.teams).filter(Boolean) || [];
          
          console.log("User team IDs:", userTeamIds);
          console.log("Teams list:", teamsList);
          
          setUserTeams(userTeamIds);
          setTeams(teamsList);
        }
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  // Fetch team members for admin
  const fetchTeamMembers = async () => {
    if (!isAdmin || !currentWorkingTeam) {
      console.log("Skipping fetchTeamMembers - isAdmin:", isAdmin, "currentWorkingTeam:", currentWorkingTeam);
      return;
    }
    
    console.log("Fetching team members for team:", currentWorkingTeam);
    
    try {
      // Fetch team members from Supabase for the selected team
      const { data: members, error } = await supabase
        .from('team_members')
        .select(`
          id,
          added_at,
          user_id,
          team_id
        `)
        .eq('team_id', currentWorkingTeam)
        .order('added_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching team members:", error);
        return;
      }
      
      if (!members || members.length === 0) {
        setTeamMembers([]);
        return;
      }
      
      // Fetch user details from profiles for each team member
      const userIds = members.map((member: any) => member.user_id);
      const { data: userProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);
        
      if (profilesError) {
        console.error("Error fetching user profiles:", profilesError);
        return;
      }
      
      // Get team name
      const selectedTeam = teams.find(t => t.id === currentWorkingTeam);
      
      // Transform the data for the UI
      const transformedMembers = members?.map((member: any) => {
        const userProfile = userProfiles?.find((profile: any) => profile.id === member.user_id);
        return {
          id: member.id,
          email: (userProfile as any)?.email || 'Unknown',
          name: (userProfile as any)?.full_name || (userProfile as any)?.email?.split('@')[0] || 'Unknown',
          team: selectedTeam?.name || 'Unknown',
          added_at: member.added_at
        };
      }) || [];
      
      setTeamMembers(transformedMembers);
      console.log("Team members fetched for team:", currentWorkingTeam, transformedMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  // Add team member
  const handleAddMember = async () => {
    if (!newMemberEmail || !newMemberTeam) {
      alert("Please enter an email and select a team");
      return;
    }
    
    try {
      console.log("Searching for user with email:", newMemberEmail.trim());
      
      // Try to find the user by email in the profiles table
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('email', newMemberEmail.trim())
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when not found
        
      console.log("Profile search result:", { userProfile, userError });
      
      if (userError) {
        console.error("Error searching for user:", userError);
        alert(`Error searching for user: ${userError.message}. 

SOLUTION: This error occurs because admin users don't have permission to search other users' profiles. 

Please run this SQL command in your Supabase SQL Editor:

CREATE POLICY "Admins can view all profiles for user search" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.role = 'admin'
    )
  );

After running this command, try adding the team member again.`);
        return;
      }
      
      if (!userProfile) {
        alert(`User with email "${newMemberEmail}" not found in profiles table. Please make sure they have signed up first and their profile was created.`);
        return;
      }
      
      const user = userProfile as any;
      
      // Check if the user is already a member of this team
      const { data: existingMember, error: checkError } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('team_id', newMemberTeam)
        .maybeSingle(); // Use maybeSingle to handle not found case
        
      if (checkError) {
        console.error("Error checking existing membership:", checkError);
        alert(`Error checking team membership: ${checkError.message}`);
        return;
      }
      
      if (existingMember) {
        alert("This user is already a member of the selected team");
        return;
      }
      
      // Add the user to the team_members table
      const { data: teamMember, error: insertError } = await supabase
        .from('team_members')
        .insert({
          user_id: user.id,
          team_id: newMemberTeam,
          added_by: userData?.id
        } as any)
        .select()
        .single();
        
      if (insertError) {
        console.error("Error adding team member:", insertError);
        alert(`Failed to add team member: ${insertError.message}`);
        return;
      }
      
      console.log("Team member added to database:", teamMember);
      
      // Add to local state for immediate UI update
      const teamName = teams.find(t => t.id === newMemberTeam)?.name || 'Unknown';
      const memberData = teamMember as any;
      const newMember = {
        id: memberData?.id || Date.now().toString(),
        email: user.email,
        name: user.full_name || user.email.split('@')[0],
        team: teamName,
        added_at: memberData?.added_at || new Date().toISOString()
      };
      
      setTeamMembers(prev => [...prev, newMember]);
      setNewMemberEmail("");
      setNewMemberTeam(undefined);
      setShowAddMemberDialog(false);
      
      alert(`Successfully added ${user.email} to ${teamName}!`);
      console.log("Team member added:", newMember);
    } catch (error) {
      console.error("Error adding team member:", error);
      alert("Failed to add team member. Please try again.");
    }
  };

  // Search for users by email/username
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchedUsers([]);
      return;
    }
    
    try {
      // Search for users in the profiles table
      const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(10);
        
      if (error) {
        console.error("Error searching users:", error);
        setSearchedUsers([]);
      } else {
        console.log("Found users:", users);
        setSearchedUsers(users || []);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchedUsers([]);
    }
  };

  // Add team member using selected user
  const handleAddMemberByUser = async (user: any) => {
    if (!newMemberTeam) return;
    
    try {
      // Add the member to Supabase team_members table
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: newMemberTeam,
          user_id: user.id,
          added_by: userData?.id
        } as any)
        .select()
        .single();
        
      if (memberError) {
        console.error("Error adding team member:", memberError);
        alert(`Failed to add team member: ${memberError.message}`);
        return;
      }
      
      if (!memberData) {
        console.error("No member data returned");
        alert("Failed to add team member: No data returned");
        return;
      }
      
      console.log("Team member added to database:", memberData);
      
      // Add to local state for immediate UI update
      const newMember = {
        id: (memberData as any).id,
        email: user.email,
        name: user.full_name || user.email.split('@')[0],
        team: teams.find(t => t.id === newMemberTeam)?.name || '',
        added_at: (memberData as any).added_at
      };
      
      setTeamMembers(prev => [...prev, newMember]);
      setNewMemberTeam(undefined);
      setShowAddMemberDialog(false);
      setSearchedUsers([]);
      setUserSearchQuery("");
      
      console.log("Team member added successfully:", newMember);
    } catch (error) {
      console.error("Error adding team member:", error);
      alert(`Failed to add team member: ${error.message || 'Unknown error'}`);
    }
  };

  // Create new team
  const handleCreateTeam = async () => {
    if (!newTeamName.trim() || !userData) return;
    
    try {
      // Create the team in Supabase
      const { data: teamData, error } = await supabase
        .from('teams')
        .insert({
          name: newTeamName,
          created_by: userData.id
        } as any)
        .select()
        .single();
        
      if (error) {
        console.error("Error creating team:", error);
        alert(`Failed to create team: ${error.message}`);
        return;
      }
      
      console.log("Team created in database:", teamData);
      
      // Add to local state for immediate UI update
      setTeams(prev => [...prev, teamData]);
      setNewTeamName("");
      setShowCreateTeamDialog(false);
      
      // Set this as the current working team and move to management workflow
      const createdTeam = teamData as any;
      if (createdTeam?.id) {
        setCurrentWorkingTeam(createdTeam.id);
        setWorkflowStep('manage_team');
      }
      
      console.log("Team created successfully:", teamData);
      
      // Show success message with next steps
      alert(`Team "${(teamData as any)?.name || newTeamName}" created successfully! 🎉\n\nYou can now add team members and upload documents.`);
      
    } catch (error) {
      console.error("Error creating team:", error);
      alert(`Failed to create team: ${error.message || 'Unknown error'}`);
    }
  };
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const authenticated = !!data.session?.user;
      setIsUser(authenticated);
      
      if (authenticated && data.session?.user) {
        setUserData(data.session.user);
        console.log("Authenticated user:", data.session.user);
        
        // Debug current user data
        debugCurrentUser();
      }
    };

    checkAuth();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authenticated = !!session?.user;
      setIsUser(authenticated);
      setUserData(session?.user || null);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Separate useEffect to fetch data when userData is available
  useEffect(() => {
    if (userData) {
      console.log("User data available, fetching data for:", userData.email, "isAdmin:", isAdmin);
      // Fetch teams first, then documents and team members
      fetchTeams();
      fetchTeamMembers();
    }
  }, [userData, isAdmin]);

  // Set initial workflow step based on admin status and teams
  useEffect(() => {
    if (isAdmin) {
      if (teams.length === 0) {
        setWorkflowStep('select_team');
        setCurrentWorkingTeam(null);
      } else if (teams.length === 1 && !currentWorkingTeam) {
        // Auto-select if only one team
        setCurrentWorkingTeam(teams[0].id);
        setWorkflowStep('manage_team');
      } else if (currentWorkingTeam && teams.some(t => t.id === currentWorkingTeam)) {
        // If we have a persisted team and it exists in the current teams, go to manage
        setWorkflowStep('manage_team');
      } else if (!currentWorkingTeam) {
        setWorkflowStep('select_team');
      } else {
        // Persisted team doesn't exist anymore, reset
        setCurrentWorkingTeam(null);
        setWorkflowStep('select_team');
      }
    }
  }, [isAdmin, teams.length, currentWorkingTeam]);

  // Fetch team members when currentWorkingTeam changes
  useEffect(() => {
    if (currentWorkingTeam && isAdmin) {
      fetchTeamMembers();
    }
  }, [currentWorkingTeam, isAdmin]);

  // Fetch team members when teams are loaded and we have a persisted team selection
  useEffect(() => {
    if (isAdmin && teams.length > 0 && currentWorkingTeam && teams.some(t => t.id === currentWorkingTeam)) {
      fetchTeamMembers();
    }
  }, [teams, isAdmin, currentWorkingTeam]);

  // Separate useEffect to fetch documents when teams are loaded
  useEffect(() => {
    if (userData && (isAdmin || userTeams.length > 0)) {
      console.log("Fetching documents for user:", userData.email, "userTeams:", userTeams);
      fetchDocuments();
    }
  }, [userData, isAdmin, userTeams]);

  // Create storage bucket if it doesn't exist
  const createStorageBucket = async () => {
    try {
      console.log("Checking for documents bucket...");
      
      // First, try to get the bucket to see if it exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error("Error listing buckets:", listError);
        alert(`Failed to list buckets: ${listError.message}\n\nThis might be a permissions issue. You may need to create the bucket manually in your Supabase dashboard.`);
        return;
      }
      
      const documentsBucket = buckets?.find(bucket => bucket.id === 'documents');
      
      if (documentsBucket) {
        console.log("Documents bucket already exists");
        alert("Documents bucket already exists! You should be able to upload files now.");
        return;
      }
      
      // Create the bucket
      const { data, error } = await supabase.storage.createBucket('documents', {
        public: false,
        allowedMimeTypes: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        fileSizeLimit: 52428800 // 50MB
      });
      
      if (error) {
        console.error("Error creating bucket:", error);
        alert(`Failed to create bucket: ${error.message}\n\nPlease create the bucket manually:\n1. Go to your Supabase dashboard\n2. Navigate to Storage\n3. Create a new bucket called 'documents'\n4. Set it to private (not public)\n5. Come back and try uploading again.`);
        return;
      }
      
      console.log("Documents bucket created successfully:", data);
      alert("Documents bucket created successfully! You can now upload files.");
      
    } catch (error) {
      console.error("Error creating storage bucket:", error);
      alert(`Failed to create storage bucket: ${error.message || 'Unknown error'}\n\nPlease create the bucket manually in your Supabase dashboard under Storage.`);
    }
  };

  // If not admin and not a regular user, show access restricted
  if (!isAdmin && !isUser) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Access Restricted</h2>
            <p className="text-muted-foreground mb-6">You need to be logged in to view this page.</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.history.back()}>
                Go Back
              </Button>
              <Button variant="default" onClick={() => window.location.href = "/login"}>
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: Document['status']) => {
    const variants = {
      ready: "default",
      processing: "secondary", 
      error: "destructive"
    } as const;
    
    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileUpload = async (files: File[]) => {
    if (!selectedTeam && isAdmin) {
      alert("Please select a team to share this document with");
      return;
    }
    
    if (!userData) {
      alert("Please log in to upload documents");
      return;
    }
    
    // Upload files to Supabase Storage and create document records
    for (const file of files) {
      const fileId = Date.now().toString() + file.name;
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
      try {
        // 1. Upload file to Supabase Storage
        console.log("Uploading file to Supabase Storage:", file.name);
        
        const fileName = `${userData.id}/${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file);
        
        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          throw uploadError;
        }
        
        console.log("File uploaded to storage:", uploadData);
        setUploadProgress(prev => ({ ...prev, [fileId]: 50 }));
        
        // 2. Create document record in database
        const { data: docData, error: docError } = await supabase
          .from('documents')
          .insert({
            filename: file.name,
            file_size: file.size,
            status: 'processing' as const,
            uploaded_by: userData.id,
            team_id: selectedTeam || null,
            file_path: uploadData.path
          } as any) // Type assertion needed until database is fully set up
          .select()
          .single();
        
        if (docError) {
          console.error("Database insert error:", docError);
          // Delete the uploaded file if database insert fails
          await supabase.storage.from('documents').remove([fileName]);
          throw docError;
        }
        
        if (!docData) {
          console.error("No document data returned");
          throw new Error("No document data returned");
        }
        
        console.log("Document record created:", docData);
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
        
        // 3. Add to local state
        const selectedTeamObj = teams.find(team => team.id === selectedTeam);
        const newDocument: Document = {
          id: (docData as any).id,
          filename: file.name,
          fileSize: file.size,
          uploadDate: new Date((docData as any).upload_date),
          status: "processing",
          uploadedBy: userData?.email || "Current User",
          teamId: selectedTeam || undefined,
          teamName: selectedTeamObj?.name || undefined
        };
        
        setDocuments(prev => [newDocument, ...prev]);
        
        // 4. Simulate processing completion
        setTimeout(() => {
          setDocuments(prev => 
            prev.map(doc => 
              doc.id === newDocument.id 
                ? { ...doc, status: "ready" } 
                : doc
            )
          );
        }, 3000);
        
        // Remove from progress tracking
        setTimeout(() => {
          setUploadProgress(prev => {
            const { [fileId]: removed, ...rest } = prev;
            return rest;
          });
        }, 1000);
        
        console.log(`Document ${file.name} uploaded successfully to team ${selectedTeamObj?.name || 'No Team'}`);
        
      } catch (error) {
        console.error("Error uploading document:", error);
        
        // Handle error state
        setUploadProgress(prev => {
          const { [fileId]: removed, ...rest } = prev;
          return rest;
        });
        
        // Show user-friendly error
        alert(`Failed to upload ${file.name}: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeam = !filterByTeam || doc.teamId === filterByTeam;
    return matchesSearch && matchesTeam;
  });

  return (
    <div className="min-h-screen pt-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {!userData && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading admin dashboard...</p>
            </div>
          </div>
        )}
        
        {userData && (
          <>
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-primary-dark mb-2">Admin Dashboard</h1>
                  <p className="text-muted-foreground">Manage documents and system configuration</p>
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateTeamDialog(true)}
                      className="flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Create Team
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    debugCurrentUser();
                    debugAllUsers();
                  }}
                  className="flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Debug Users
                </Button>
                <Button
                  variant="outline"
                  onClick={verifyDatabaseSetup}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Check DB Setup
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    const success = await fixCurrentUserProfile();
                    if (success) {
                      // Refresh the page data
                      window.location.reload();
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Fix Profile
                </Button>
                <Button
                  variant="outline"
                  onClick={createStorageBucket}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Create Storage
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* User info banner for authenticated users */}
        {isUser && userData && (
          <Card className="mb-6 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Welcome, {userData.email}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isAdmin ? "Admin access granted" : "You have access to view documents"}
                    </p>
                    {!isAdmin && teams.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Teams: {teams.map(team => team.name).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant={isAdmin ? "default" : "secondary"}>
                  {isAdmin ? "Admin" : "User"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin Workflow - Step by Step */}
        {isAdmin && (
          <>
            {/* Step 1: Team Selection/Creation */}
            {workflowStep === 'select_team' && (
              <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-blue-500/5">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {teams.length === 0 ? "Create Your First Team" : "Select a Team to Work With"}
                    </h3>
                    <p className="text-muted-foreground">
                      {teams.length === 0 
                        ? "Start by creating a team to organize your documents and members."
                        : "Choose an existing team or create a new one to manage documents and members."
                      }
                    </p>
                  </div>

                  {/* Existing Teams */}
                  {teams.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-3">Your Teams:</h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {teams.map(team => (
                          <div
                            key={team.id}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              currentWorkingTeam === team.id 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => setCurrentWorkingTeam(team.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">{team.name}</h5>
                                <p className="text-sm text-muted-foreground">
                                  Created {new Date(team.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              {currentWorkingTeam === team.id && (
                                <CheckCircle className="w-5 h-5 text-primary" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={() => setShowCreateTeamDialog(true)}
                      className="flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      {teams.length === 0 ? "Create Your First Team" : "Create New Team"}
                    </Button>
                    
                    {currentWorkingTeam && (
                      <Button 
                        onClick={() => setWorkflowStep('manage_team')}
                        variant="default"
                        className="flex items-center gap-2"
                      >
                        <ArrowRight className="w-4 h-4" />
                        Continue with Selected Team
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Team Management */}
            {workflowStep === 'manage_team' && currentWorkingTeam && (
              <Card className="mb-6 border-green-500/20 bg-gradient-to-r from-green-500/5 to-emerald-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          Working with: {teams.find(t => t.id === currentWorkingTeam)?.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Add team members and upload documents for this team
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => setWorkflowStep('select_team')}
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Change Team
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Documents</p>
                  <p className="text-2xl font-bold text-primary-dark">{documents.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Processing</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {documents.filter(d => d.status === 'processing').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ready</p>
                  <p className="text-2xl font-bold text-green-600">
                    {documents.filter(d => d.status === 'ready').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">n8n Status</p>
                  <p className="text-sm font-medium text-green-600">Connected</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Document Upload */}
          {((isAdmin && workflowStep === 'manage_team') || !isAdmin) && (
          <div className="lg:col-span-1">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  {teams.length === 0 ? "Upload Documents" : "Share Documents with Your Team"}
                </CardTitle>
                {teams.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Upload documents to share with your {teams.length} team{teams.length === 1 ? '' : 's'}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                    isDragging 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Cloud className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop files here, or
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Choose Files
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={(e) => e.target.files && handleFileUpload(Array.from(e.target.files))}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Supports PDF, DOC, DOCX, TXT
                  </p>
                </div>

                {/* Team Selection */}
                <div className="mt-4">
                  <Label htmlFor="team-select">Share with Team</Label>
                  <Select value={selectedTeam || ""} onValueChange={setSelectedTeam}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a team to share with" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map(team => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                      {teams.length === 0 && (
                        <SelectItem value="no-teams" disabled>
                          No teams available - create a team first
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Documents will be accessible to all members of the selected team
                  </p>
                </div>

                {/* Upload Progress */}
                {Object.entries(uploadProgress).map(([fileId, progress]) => (
                  <div key={fileId} className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium truncate">
                        {fileId.substring(13)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          )}

          {/* Team Member Management - Admin Only */}
          {isAdmin && workflowStep === 'manage_team' && (
          <div className="lg:col-span-1">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Team Members
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={() => setShowAddMemberDialog(true)}
                    className="flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamMembers.length === 0 ? (
                    <div className="text-center py-6">
                      <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No team members yet</p>
                      <p className="text-xs text-muted-foreground mb-4">Add members to your teams</p>
                      {teams.length > 0 && (
                        <Button
                          size="sm"
                          onClick={() => setShowAddMemberDialog(true)}
                          className="flex items-center gap-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          Add Your First Member
                        </Button>
                      )}
                    </div>
                  ) : (
                    teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{member.email}</p>
                            <p className="text-xs text-muted-foreground">{member.team}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={async () => {
                            try {
                              const { error } = await supabase
                                .from('team_members')
                                .delete()
                                .eq('id', member.id);
                              
                              if (error) {
                                console.error("Error removing team member:", error);
                                alert("Failed to remove team member");
                                return;
                              }
                              
                              // Remove from local state
                              setTeamMembers(prev => prev.filter(m => m.id !== member.id));
                              console.log("Team member removed:", member.email);
                            } catch (error) {
                              console.error("Error removing team member:", error);
                              alert("Failed to remove team member");
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          )}

          {/* Teams Section for Non-Admin Users */}
          {!isAdmin && (
            <div className="lg:col-span-2 mb-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    My Teams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {teams.length > 0 ? (
                    <div className="space-y-2">
                      {teams.map(team => (
                        <div key={team.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <h4 className="font-medium">{team.name}</h4>
                            <p className="text-sm text-muted-foreground">Team Member</p>
                          </div>
                          <Badge variant="secondary">Active</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">No Teams Found</h3>
                      <p className="text-sm text-muted-foreground">
                        You haven't been added to any teams yet. Contact your admin to get access.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Document Management */}
          {((isAdmin && workflowStep === 'manage_team') || !isAdmin) && (
          <div className="lg:col-span-2" data-section="documents">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {isAdmin ? "Document Library" : "Available Documents"}
              </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    {isAdmin && (
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    )}
                  </div>
                </div>
                {!isAdmin && teams.length > 0 && (
                  <div className="flex items-center space-x-2 mt-2">
                    <Label htmlFor="filter-team">Filter by Team:</Label>
                    <select
                      id="filter-team"
                      value={filterByTeam || ""}
                      onChange={(e) => setFilterByTeam(e.target.value || undefined)}
                      className="p-2 border rounded-md bg-background text-foreground"
                    >
                      <option value="">All Teams</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                {isAdmin && (
                  <div className="mt-2">
                    <Label htmlFor="team-select">Share with Team</Label>
                    <select
                      id="team-select"
                      value={selectedTeam}
                      onChange={(e) => setSelectedTeam(e.target.value)}
                      className="w-full p-2 mt-1 border rounded-md bg-background text-foreground"
                    >
                      <option value="">Select a team</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="relative mt-2">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:shadow-soft transition-shadow"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-foreground truncate">
                            {doc.filename}
                          </h4>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                            <span>{formatFileSize(doc.fileSize)}</span>
                            <span>•</span>
                            <span>{formatDate(doc.uploadDate)}</span>
                            <span>•</span>
                            <span>{doc.uploadedBy}</span>
                            <span>•</span>
                            <Badge variant="outline" className="bg-muted/50">
                               {doc.teamName || "No Team"}
                             </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(doc.status)}
                          {getStatusBadge(doc.status)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {isAdmin && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              // In a real implementation, you would delete the document from Supabase
                              // const { error } = await supabase
                              //   .from('documents')
                              //   .delete()
                              //   .eq('id', doc.id);
                              
                              // For now, we'll just remove it from the state
                              setDocuments(prev => prev.filter(d => d.id !== doc.id));
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {filteredDocuments.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        {!isAdmin && teams.length === 0 
                          ? "No Teams Found" 
                          : "No Documents Found"
                        }
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        {!isAdmin && teams.length === 0 
                          ? "You haven't been added to any teams yet. Contact your admin to get access to documents."
                          : isAdmin 
                            ? "Upload your first document to get started. Documents will be shared with your team members."
                            : "No documents have been shared with your teams yet. Contact your admin if you need access to specific documents."
                        }
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          )}
        </div>
          </>
        )}

      {/* Add Member Dialog */}
      <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new member to one of your teams. They will receive access to documents shared with their team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Search for existing users */}
            <div>
              <Label htmlFor="user-search">Search for Users</Label>
              <Input
                id="user-search"
                type="text"
                placeholder="Search by name or email..."
                value={userSearchQuery}
                onChange={(e) => {
                  setUserSearchQuery(e.target.value);
                  searchUsers(e.target.value);
                }}
              />
              {searchedUsers.length > 0 && (
                <div className="mt-2 border rounded-md max-h-40 overflow-y-auto">
                  {searchedUsers.map(user => (
                    <div 
                      key={user.id} 
                      className="p-2 hover:bg-muted cursor-pointer border-b last:border-b-0"
                      onClick={() => {
                        setNewMemberEmail(user.email);
                        setUserSearchQuery(user.full_name);
                        setSearchedUsers([]);
                      }}
                    >
                      <div className="font-medium">{user.full_name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Or enter email manually */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or enter manually</span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="member-email">Email Address</Label>
              <Input
                id="member-email"
                type="email"
                placeholder="member@example.com"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="member-team">Assign to Team</Label>
              <Select value={newMemberTeam || ""} onValueChange={setNewMemberTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMemberDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddMember}
              disabled={!newMemberEmail || !newMemberTeam}
            >
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Team Dialog */}
      <Dialog open={showCreateTeamDialog} onOpenChange={setShowCreateTeamDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Create a new team to organize your documents and team members.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                type="text"
                placeholder="Enter team name..."
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTeamDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTeam}
              disabled={!newTeamName.trim()}
            >
              Create Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}