import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Calendar & Todo App Server - Updated 2025-01-11 14:30 UTC
const app = new Hono();

// Supabase Admin Client (서버 전용)
const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
};

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-115a0b3d/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ===== Authentication =====

// Get current user profile
app.get("/make-server-115a0b3d/me", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    return c.json({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      avatar: user.user_metadata?.avatar || `https://images.unsplash.com/photo-1613145997970-db84a7975fbb?w=100&h=100&fit=crop`,
      isMe: true,
      color: user.user_metadata?.color || '#3b82f6',
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return c.json({ error: "Failed to fetch user profile" }, 500);
  }
});

// Sign up endpoint
app.post("/make-server-115a0b3d/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    const supabase = getSupabaseAdmin();
    
    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.error("Sign up error:", error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ 
      success: true, 
      user: { 
        id: data.user.id, 
        email: data.user.email,
        name: data.user.user_metadata.name,
      } 
    });
  } catch (error) {
    console.error("Sign up error:", error);
    return c.json({ error: "Failed to create user" }, 500);
  }
});

// Helper function to get user from access token
const getUserFromToken = async (authHeader: string | null) => {
  console.log('🔐 getUserFromToken - authHeader:', authHeader ? `Bearer ${authHeader.substring(7, 27)}...` : 'null');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('❌ getUserFromToken - Invalid or missing auth header');
    return null;
  }
  
  const accessToken = authHeader.substring(7);
  console.log('🔑 getUserFromToken - Token length:', accessToken.length);
  console.log('🔑 getUserFromToken - Token preview:', accessToken.substring(0, 30) + '...');
  
  // Check if it's the anon key (anon key is not a user token)
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  if (accessToken === anonKey) {
    console.error('❌ getUserFromToken - Anon key detected (not a user token)');
    return null;
  }
  
  const supabase = getSupabaseAdmin();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error) {
      console.error('❌ getUserFromToken - Supabase error:', error.message || error);
      console.error('❌ getUserFromToken - Error details:', JSON.stringify(error));
      return null;
    }
    
    if (!user) {
      console.error('❌ getUserFromToken - No user found for token');
      return null;
    }
    
    console.log('✅ getUserFromToken - User found:', user.email);
    return user;
  } catch (error) {
    console.error('❌ getUserFromToken - Exception:', error);
    return null;
  }
};

// ===== Todos & Events =====

// Get all todos (user-specific + friends' public todos)
app.get("/make-server-115a0b3d/todos", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get user's own todos
    const myTodos = await kv.get(`todos:${user.id}`) || [];
    
    // Get friends list
    const friends = await kv.get(`friends:${user.id}`) || [];
    
    // Get all friends' public todos
    const friendTodos = [];
    for (const friend of friends) {
      const friendAllTodos = await kv.get(`todos:${friend.friendId}`) || [];
      // Only include public todos from friends
      const publicTodos = friendAllTodos.filter((todo: any) => todo.isPublic);
      friendTodos.push(...publicTodos);
    }
    
    // Combine user's todos and friends' public todos
    const allTodos = [...myTodos, ...friendTodos];
    
    return c.json(allTodos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    return c.json({ error: "Failed to fetch todos" }, 500);
  }
});

// Create todo (user-specific)
app.post("/make-server-115a0b3d/todos", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const todo = await c.req.json();
    const todos = await kv.get(`todos:${user.id}`) || [];
    todos.push(todo);
    await kv.set(`todos:${user.id}`, todos);

    // If todo has invitations (event invite), create notifications
    if (todo.invitedUsers && todo.invitedUsers.length > 0) {
      const supabase = getSupabaseAdmin();
      
      for (const invitedUserId of todo.invitedUsers) {
        // Skip if inviting self
        if (invitedUserId === user.id) continue;

        // Get invited user info
        const { data: invitedUserData } = await supabase.auth.admin.getUserById(invitedUserId);
        if (!invitedUserData) continue;

        const notification = {
          id: `n${Date.now()}_${invitedUserId}`,
          type: 'event_invite',
          fromUserId: user.id,
          fromUserName: user.user_metadata?.name || user.email!.split('@')[0],
          fromUserAvatar: user.user_metadata?.avatar,
          toUserId: invitedUserId,
          status: 'pending',
          createdAt: new Date().toISOString(),
          eventId: todo.id,
          eventTitle: todo.title,
          eventDate: todo.startDate || todo.date,
        };

        const notifications = await kv.get(`notifications:${invitedUserId}`) || [];
        notifications.push(notification);
        await kv.set(`notifications:${invitedUserId}`, notifications);
      }
    }

    return c.json(todo, 201);
  } catch (error) {
    console.error("Error creating todo:", error);
    return c.json({ error: "Failed to create todo" }, 500);
  }
});

// Update todo (user-specific)
app.put("/make-server-115a0b3d/todos/:id", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    const updatedTodo = await c.req.json();
    const todos = await kv.get(`todos:${user.id}`) || [];
    const index = todos.findIndex((t: any) => t.id === id);
    
    if (index === -1) {
      return c.json({ error: "Todo not found" }, 404);
    }
    
    todos[index] = updatedTodo;
    await kv.set(`todos:${user.id}`, todos);
    return c.json(updatedTodo);
  } catch (error) {
    console.error("Error updating todo:", error);
    return c.json({ error: "Failed to update todo" }, 500);
  }
});

// Delete todo (user-specific)
app.delete("/make-server-115a0b3d/todos/:id", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    const todos = await kv.get(`todos:${user.id}`) || [];
    const filtered = todos.filter((t: any) => t.id !== id);
    await kv.set(`todos:${user.id}`, filtered);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting todo:", error);
    return c.json({ error: "Failed to delete todo" }, 500);
  }
});

// ===== Records =====

// Get all records (user-specific)
app.get("/make-server-115a0b3d/records", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const records = await kv.get(`records:${user.id}`) || [];
    return c.json(records);
  } catch (error) {
    console.error("Error fetching records:", error);
    return c.json({ error: "Failed to fetch records" }, 500);
  }
});

// Create record (user-specific)
app.post("/make-server-115a0b3d/records", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const record = await c.req.json();
    const records = await kv.get(`records:${user.id}`) || [];
    records.push(record);
    await kv.set(`records:${user.id}`, records);
    return c.json(record, 201);
  } catch (error) {
    console.error("Error creating record:", error);
    return c.json({ error: "Failed to create record" }, 500);
  }
});

// ===== Comments =====

// Get all comments (user-specific)
app.get("/make-server-115a0b3d/comments", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const comments = await kv.get(`comments:${user.id}`) || [];
    return c.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return c.json({ error: "Failed to fetch comments" }, 500);
  }
});

// Create comment (user-specific)
app.post("/make-server-115a0b3d/comments", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const comment = await c.req.json();
    const comments = await kv.get(`comments:${user.id}`) || [];
    comments.push(comment);
    await kv.set(`comments:${user.id}`, comments);
    return c.json(comment, 201);
  } catch (error) {
    console.error("Error creating comment:", error);
    return c.json({ error: "Failed to create comment" }, 500);
  }
});

// Delete comment using POST method (user-specific)
app.post("/make-server-115a0b3d/comments/:id/delete", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    console.log("🟢 DELETE COMMENT - ID:", id);
    
    const comments = await kv.get(`comments:${user.id}`) || [];
    console.log("🟢 DELETE COMMENT - Total comments before:", comments.length);
    
    const filtered = comments.filter((comment: any) => comment.id !== id);
    console.log("🟢 DELETE COMMENT - Total comments after:", filtered.length);
    
    await kv.set(`comments:${user.id}`, filtered);
    console.log("🟢 DELETE COMMENT - Successfully saved to KV");
    
    return c.json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.error("🔴 DELETE COMMENT - Error:", error);
    return c.json({ error: "Failed to delete comment" }, 500);
  }
});

// Delete comment using DELETE method (backup) (user-specific)
app.delete("/make-server-115a0b3d/comments/:id", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    console.log("🟢 DELETE COMMENT (DELETE method) - ID:", id);
    
    const comments = await kv.get(`comments:${user.id}`) || [];
    const filtered = comments.filter((comment: any) => comment.id !== id);
    await kv.set(`comments:${user.id}`, filtered);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("🔴 DELETE COMMENT (DELETE method) - Error:", error);
    return c.json({ error: "Failed to delete comment" }, 500);
  }
});

// ===== Journals =====

// Get all journals (user-specific + friends' public journals)
app.get("/make-server-115a0b3d/journals", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get user's own journals
    const myJournals = await kv.get(`journals:${user.id}`) || [];
    
    // Get friends list
    const friends = await kv.get(`friends:${user.id}`) || [];
    
    // Get all friends' public journals
    const friendJournals = [];
    for (const friend of friends) {
      const friendAllJournals = await kv.get(`journals:${friend.friendId}`) || [];
      // Only include public journals from friends
      const publicJournals = friendAllJournals.filter((journal: any) => journal.isPublic);
      friendJournals.push(...publicJournals);
    }
    
    // Combine user's journals and friends' public journals
    const allJournals = [...myJournals, ...friendJournals];
    
    return c.json(allJournals);
  } catch (error) {
    console.error("Error fetching journals:", error);
    return c.json({ error: "Failed to fetch journals" }, 500);
  }
});

// Create or update journal (user-specific)
app.post("/make-server-115a0b3d/journals", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const journal = await c.req.json();
    const journals = await kv.get(`journals:${user.id}`) || [];
    const index = journals.findIndex((j: any) => j.id === journal.id);
    
    if (index !== -1) {
      journals[index] = journal;
    } else {
      journals.push(journal);
    }
    
    await kv.set(`journals:${user.id}`, journals);
    return c.json(journal, 201);
  } catch (error) {
    console.error("Error saving journal:", error);
    return c.json({ error: "Failed to save journal" }, 500);
  }
});

// ===== Journal Comments =====

// Get all journal comments (user-specific)
app.get("/make-server-115a0b3d/journal-comments", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const comments = await kv.get(`journalComments:${user.id}`) || [];
    return c.json(comments);
  } catch (error) {
    console.error("Error fetching journal comments:", error);
    return c.json({ error: "Failed to fetch journal comments" }, 500);
  }
});

// Create journal comment (user-specific)
app.post("/make-server-115a0b3d/journal-comments", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const comment = await c.req.json();
    const comments = await kv.get(`journalComments:${user.id}`) || [];
    comments.push(comment);
    await kv.set(`journalComments:${user.id}`, comments);
    return c.json(comment, 201);
  } catch (error) {
    console.error("Error creating journal comment:", error);
    return c.json({ error: "Failed to create journal comment" }, 500);
  }
});

// ===== Friends & Friend Requests =====

// Send friend request
app.post("/make-server-115a0b3d/friend-requests", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { toUserEmail } = await c.req.json();
    
    if (!toUserEmail) {
      return c.json({ error: "Recipient email is required" }, 400);
    }

    // Check if user exists with this email
    const supabase = getSupabaseAdmin();
    const { data: toUserData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error("Error finding user:", userError);
      return c.json({ error: "Failed to find user" }, 500);
    }

    const toUser = toUserData.users.find(u => u.email === toUserEmail);
    
    if (!toUser) {
      return c.json({ error: "User with this email does not exist" }, 404);
    }

    if (toUser.id === user.id) {
      return c.json({ error: "Cannot send friend request to yourself" }, 400);
    }

    // Check if already friends
    const friends = await kv.get(`friends:${user.id}`) || [];
    const alreadyFriends = friends.some((f: any) => f.friendId === toUser.id);
    
    if (alreadyFriends) {
      return c.json({ error: "Already friends with this user" }, 400);
    }

    // Check if I already sent a pending request
    const mySentRequests = await kv.get(`friendRequests:sent:${user.id}`) || [];
    const alreadySent = mySentRequests.some((r: any) => 
      r.toUserId === toUser.id && r.status === 'pending'
    );
    
    if (alreadySent) {
      return c.json({ error: "Friend request already sent" }, 400);
    }

    // Check if they already sent me a pending request
    const myReceivedRequests = await kv.get(`friendRequests:${user.id}`) || [];
    const theyAlreadySent = myReceivedRequests.some((r: any) => 
      r.fromUserId === toUser.id && r.status === 'pending'
    );
    
    if (theyAlreadySent) {
      return c.json({ error: "This user already sent you a friend request. Please check your received requests." }, 400);
    }

    const friendRequest = {
      id: `fr${Date.now()}`,
      fromUserId: user.id,
      fromUserEmail: user.email!,
      fromUserName: user.user_metadata?.name || user.email!.split('@')[0],
      fromUserAvatar: user.user_metadata?.avatar || `https://images.unsplash.com/photo-1613145997970-db84a7975fbb?w=100&h=100&fit=crop`,
      toUserEmail,
      toUserId: toUser.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Save to recipient's received requests
    const receivedRequests = await kv.get(`friendRequests:${toUser.id}`) || [];
    receivedRequests.push(friendRequest);
    await kv.set(`friendRequests:${toUser.id}`, receivedRequests);

    // Save to sender's sent requests
    const sentRequests = await kv.get(`friendRequests:sent:${user.id}`) || [];
    sentRequests.push(friendRequest);
    await kv.set(`friendRequests:sent:${user.id}`, sentRequests);

    // Create notification for recipient
    const notification = {
      id: `n${Date.now()}`,
      type: 'friend_request',
      fromUserId: user.id,
      fromUserName: user.user_metadata?.name || user.email!.split('@')[0],
      fromUserAvatar: user.user_metadata?.avatar,
      toUserId: toUser.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const notifications = await kv.get(`notifications:${toUser.id}`) || [];
    notifications.push(notification);
    await kv.set(`notifications:${toUser.id}`, notifications);

    return c.json(friendRequest, 201);
  } catch (error) {
    console.error("Error creating friend request:", error);
    return c.json({ error: "Failed to create friend request" }, 500);
  }
});

// Get received friend requests
app.get("/make-server-115a0b3d/friend-requests/received", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const requests = await kv.get(`friendRequests:${user.id}`) || [];
    // Only return pending requests
    const pendingRequests = requests.filter((r: any) => r.status === 'pending');
    return c.json(pendingRequests);
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    return c.json({ error: "Failed to fetch friend requests" }, 500);
  }
});

// Get sent friend requests
app.get("/make-server-115a0b3d/friend-requests/sent", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const requests = await kv.get(`friendRequests:sent:${user.id}`) || [];
    return c.json(requests);
  } catch (error) {
    console.error("Error fetching sent requests:", error);
    return c.json({ error: "Failed to fetch sent requests" }, 500);
  }
});

// Accept or reject friend request
app.post("/make-server-115a0b3d/friend-requests/:id/:action", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const requestId = c.req.param("id");
    const action = c.req.param("action"); // 'accept' or 'reject'

    if (action !== 'accept' && action !== 'reject') {
      return c.json({ error: "Invalid action" }, 400);
    }

    // Get received requests
    const receivedRequests = await kv.get(`friendRequests:${user.id}`) || [];
    const requestIndex = receivedRequests.findIndex((r: any) => r.id === requestId);
    
    if (requestIndex === -1) {
      return c.json({ error: "Friend request not found" }, 404);
    }

    const request = receivedRequests[requestIndex];
    
    if (request.status !== 'pending') {
      return c.json({ error: "Friend request already processed" }, 400);
    }

    // Update request status
    request.status = action === 'accept' ? 'accepted' : 'rejected';
    receivedRequests[requestIndex] = request;
    await kv.set(`friendRequests:${user.id}`, receivedRequests);

    // Update sender's sent requests
    const sentRequests = await kv.get(`friendRequests:sent:${request.fromUserId}`) || [];
    const sentIndex = sentRequests.findIndex((r: any) => r.id === requestId);
    if (sentIndex !== -1) {
      sentRequests[sentIndex].status = request.status;
      await kv.set(`friendRequests:sent:${request.fromUserId}`, sentRequests);
    }

    // If accepted, create friendship
    if (action === 'accept') {
      const supabase = getSupabaseAdmin();
      const { data: fromUserData } = await supabase.auth.admin.getUserById(request.fromUserId);
      
      // Add to user's friends list
      const userFriends = await kv.get(`friends:${user.id}`) || [];
      userFriends.push({
        id: `f${Date.now()}`,
        userId: user.id,
        friendId: request.fromUserId,
        friendName: request.fromUserName,
        friendEmail: request.fromUserEmail,
        friendAvatar: request.fromUserAvatar,
        createdAt: new Date().toISOString(),
      });
      await kv.set(`friends:${user.id}`, userFriends);

      // Add to sender's friends list
      const senderFriends = await kv.get(`friends:${request.fromUserId}`) || [];
      senderFriends.push({
        id: `f${Date.now() + 1}`,
        userId: request.fromUserId,
        friendId: user.id,
        friendName: user.user_metadata?.name || user.email!.split('@')[0],
        friendEmail: user.email!,
        friendAvatar: user.user_metadata?.avatar || `https://images.unsplash.com/photo-1613145997970-db84a7975fbb?w=100&h=100&fit=crop`,
        createdAt: new Date().toISOString(),
      });
      await kv.set(`friends:${request.fromUserId}`, senderFriends);
    }

    return c.json({ success: true, request });
  } catch (error) {
    console.error("Error processing friend request:", error);
    return c.json({ error: "Failed to process friend request" }, 500);
  }
});

// Get friends list
app.get("/make-server-115a0b3d/friends", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const friends = await kv.get(`friends:${user.id}`) || [];
    return c.json(friends);
  } catch (error) {
    console.error("Error fetching friends:", error);
    return c.json({ error: "Failed to fetch friends" }, 500);
  }
});

// Remove friend
app.delete("/make-server-115a0b3d/friends/:friendId", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const friendId = c.req.param("friendId");

    // Remove from user's friends list
    const userFriends = await kv.get(`friends:${user.id}`) || [];
    const filteredUserFriends = userFriends.filter((f: any) => f.friendId !== friendId);
    await kv.set(`friends:${user.id}`, filteredUserFriends);

    // Remove from friend's friends list
    const friendFriends = await kv.get(`friends:${friendId}`) || [];
    const filteredFriendFriends = friendFriends.filter((f: any) => f.friendId !== user.id);
    await kv.set(`friends:${friendId}`, filteredFriendFriends);

    return c.json({ success: true });
  } catch (error) {
    console.error("Error removing friend:", error);
    return c.json({ error: "Failed to remove friend" }, 500);
  }
});

// ===== Groups =====

// Create group
app.post("/make-server-115a0b3d/groups", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { name, memberIds } = await c.req.json();
    
    if (!name || !name.trim()) {
      return c.json({ error: "Group name is required" }, 400);
    }

    // Validate that all memberIds are friends
    const friends = await kv.get(`friends:${user.id}`) || [];
    const friendIds = friends.map((f: any) => f.friendId);
    
    const invalidMembers = (memberIds || []).filter((id: string) => !friendIds.includes(id) && id !== user.id);
    if (invalidMembers.length > 0) {
      return c.json({ error: "Can only add friends to groups" }, 400);
    }

    // Generate a color based on group name
    const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];
    const colorIndex = name.charCodeAt(0) % colors.length;
    
    const group = {
      id: `g${Date.now()}`,
      name,
      avatar: `https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=100&h=100&fit=crop`,
      memberIds: [user.id, ...(memberIds || [])],
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      color: colors[colorIndex],
    };

    const groups = await kv.get(`groups:${user.id}`) || [];
    groups.push(group);
    await kv.set(`groups:${user.id}`, groups);

    return c.json(group, 201);
  } catch (error) {
    console.error("Error creating group:", error);
    return c.json({ error: "Failed to create group" }, 500);
  }
});

// Get all groups
app.get("/make-server-115a0b3d/groups", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const groups = await kv.get(`groups:${user.id}`) || [];
    return c.json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    return c.json({ error: "Failed to fetch groups" }, 500);
  }
});

// Update group
app.put("/make-server-115a0b3d/groups/:groupId", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const groupId = c.req.param("groupId");
    const { name, memberIds } = await c.req.json();

    const groups = await kv.get(`groups:${user.id}`) || [];
    const groupIndex = groups.findIndex((g: any) => g.id === groupId);
    
    if (groupIndex === -1) {
      return c.json({ error: "Group not found" }, 404);
    }

    const group = groups[groupIndex];
    
    if (group.createdBy !== user.id) {
      return c.json({ error: "Only group creator can update group" }, 403);
    }

    // Validate that all memberIds are friends
    const friends = await kv.get(`friends:${user.id}`) || [];
    const friendIds = friends.map((f: any) => f.friendId);
    
    const invalidMembers = (memberIds || []).filter((id: string) => !friendIds.includes(id) && id !== user.id);
    if (invalidMembers.length > 0) {
      return c.json({ error: "Can only add friends to groups" }, 400);
    }

    // Update group
    group.name = name || group.name;
    group.memberIds = [user.id, ...(memberIds || [])];
    groups[groupIndex] = group;
    
    await kv.set(`groups:${user.id}`, groups);

    return c.json(group);
  } catch (error) {
    console.error("Error updating group:", error);
    return c.json({ error: "Failed to update group" }, 500);
  }
});

// Delete group
app.delete("/make-server-115a0b3d/groups/:groupId", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const groupId = c.req.param("groupId");
    const groups = await kv.get(`groups:${user.id}`) || [];
    const group = groups.find((g: any) => g.id === groupId);
    
    if (!group) {
      return c.json({ error: "Group not found" }, 404);
    }

    if (group.createdBy !== user.id) {
      return c.json({ error: "Only group creator can delete group" }, 403);
    }

    const filteredGroups = groups.filter((g: any) => g.id !== groupId);
    await kv.set(`groups:${user.id}`, filteredGroups);

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting group:", error);
    return c.json({ error: "Failed to delete group" }, 500);
  }
});

// ===== Notifications =====

// Get all notifications for current user
app.get("/make-server-115a0b3d/notifications", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const notifications = await kv.get(`notifications:${user.id}`) || [];
    return c.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return c.json({ error: "Failed to fetch notifications" }, 500);
  }
});

// Respond to notification (accept/reject)
app.post("/make-server-115a0b3d/notifications/:notificationId/respond", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const notificationId = c.req.param("notificationId");
    const { response } = await c.req.json(); // 'accept' or 'reject'

    const notifications = await kv.get(`notifications:${user.id}`) || [];
    const notification = notifications.find((n: any) => n.id === notificationId);

    if (!notification) {
      return c.json({ error: "Notification not found" }, 404);
    }

    // Update notification status
    const updatedNotifications = notifications.map((n: any) => 
      n.id === notificationId ? { ...n, status: response === 'accept' ? 'accepted' : 'rejected' } : n
    );
    await kv.set(`notifications:${user.id}`, updatedNotifications);

    // Send response notification to the sender
    const senderNotifications = await kv.get(`notifications:${notification.fromUserId}`) || [];
    const responseNotification = {
      id: `n${Date.now()}`,
      type: notification.type === 'event_invite' ? 'event_response' : 'friend_response',
      fromUserId: user.id,
      fromUserName: user.user_metadata?.name || user.email!.split('@')[0],
      fromUserAvatar: user.user_metadata?.avatar,
      toUserId: notification.fromUserId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      responseType: response,
      eventId: notification.eventId,
      eventTitle: notification.eventTitle,
    };
    senderNotifications.push(responseNotification);
    await kv.set(`notifications:${notification.fromUserId}`, senderNotifications);

    return c.json({ success: true });
  } catch (error) {
    console.error("Error responding to notification:", error);
    return c.json({ error: "Failed to respond to notification" }, 500);
  }
});

// Accept friend from notification
app.post("/make-server-115a0b3d/friends/accept", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { fromUserId } = await c.req.json();

    // Get sender's profile
    const supabase = getSupabaseAdmin();
    const { data: senderData, error: senderError } = await supabase.auth.admin.getUserById(fromUserId);
    
    if (senderError || !senderData) {
      return c.json({ error: "Sender not found" }, 404);
    }

    const sender = senderData.user;

    // Add to current user's friends
    const userFriends = await kv.get(`friends:${user.id}`) || [];
    userFriends.push({
      id: `f${Date.now()}_1`,
      userId: user.id,
      friendId: fromUserId,
      friendName: sender.user_metadata?.name || sender.email!.split('@')[0],
      friendEmail: sender.email!,
      friendAvatar: sender.user_metadata?.avatar,
      createdAt: new Date().toISOString(),
    });
    await kv.set(`friends:${user.id}`, userFriends);

    // Add to sender's friends
    const senderFriends = await kv.get(`friends:${fromUserId}`) || [];
    senderFriends.push({
      id: `f${Date.now()}_2`,
      userId: fromUserId,
      friendId: user.id,
      friendName: user.user_metadata?.name || user.email!.split('@')[0],
      friendEmail: user.email!,
      friendAvatar: user.user_metadata?.avatar,
      createdAt: new Date().toISOString(),
    });
    await kv.set(`friends:${fromUserId}`, senderFriends);

    return c.json({ success: true });
  } catch (error) {
    console.error("Error accepting friend:", error);
    return c.json({ error: "Failed to accept friend" }, 500);
  }
});

// ===== User Profile =====

// Get user by ID
app.get("/make-server-115a0b3d/users/:userId", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = c.req.param("userId");
    const supabase = getSupabaseAdmin();
    const { data: targetUser, error } = await supabase.auth.admin.getUserById(userId);

    if (error || !targetUser) {
      return c.json({ error: "User not found" }, 404);
    }

    // Return user profile
    return c.json({
      id: targetUser.user.id,
      name: targetUser.user.user_metadata?.name || targetUser.user.email!.split('@')[0],
      email: targetUser.user.email!,
      avatar: targetUser.user.user_metadata?.avatar || `https://images.unsplash.com/photo-1613145997970-db84a7975fbb?w=100&h=100&fit=crop`,
      isMe: false,
      color: '#10b981',
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return c.json({ error: "Failed to fetch user profile" }, 500);
  }
});

// ===== Initialize Data (for first time use) =====

app.post("/make-server-115a0b3d/initialize", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { todos, records, comments, journals, journalComments } = await c.req.json();
    
    await kv.set(`todos:${user.id}`, todos || []);
    await kv.set(`records:${user.id}`, records || []);
    await kv.set(`comments:${user.id}`, comments || []);
    await kv.set(`journals:${user.id}`, journals || []);
    await kv.set(`journalComments:${user.id}`, journalComments || []);
    
    return c.json({ success: true, message: "Data initialized successfully" });
  } catch (error) {
    console.error("Error initializing data:", error);
    return c.json({ error: "Failed to initialize data" }, 500);
  }
});

Deno.serve(app.fetch);
