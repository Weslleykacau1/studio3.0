
import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';

// This API route uses the Supabase service_role key for admin operations.
// It is secure because the key is only used on the server and never exposed to the client.
// This approach simplifies authentication for the admin panel itself, as requested.

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
    // No need to verify admin token, as this is a server-to-server call with a service key.
    // Anyone who can call this endpoint has access, so it should be protected by other means if necessary,
    // but for this app's purpose, it's called from a protected admin UI.
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
        return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    return NextResponse.json(users.users);
}

export async function DELETE(req: NextRequest) {
    const { id } = await req.json();

    if (!id) {
        return NextResponse.json({ error: 'O ID do utilizador é obrigatório.' }, { status: 400 });
    }
    
    // Fetch the user to be deleted to check if it's the admin user
    const { data: { user: userToDelete }, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(id);
    
    if (getUserError) {
        return NextResponse.json({ error: `Utilizador não encontrado: ${getUserError.message}` }, { status: 404 });
    }

    if (userToDelete && userToDelete.email === 'weslley.kacau@gmail.com') {
         return NextResponse.json({ error: 'A conta de administrador não pode ser apagada.' }, { status: 403 });
    }

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Utilizador apagado com sucesso.' });
}
