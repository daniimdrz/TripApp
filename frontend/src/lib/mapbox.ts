import { supabase } from './supabase';

const MAPBOX_USAGE_LIMIT = 20000; // Límite de 20,000 cargas
const MAPBOX_SEARCH_LIMIT = 20000; // Límite de 20,000 búsquedas

export async function checkMapboxUsage(): Promise<boolean> {
  try {
    // Obtener el contador actual
    const { data, error } = await supabase
      .from('mapbox_usage')
      .select('id, count')
      .single();

    console.log('Mapbox usage check:', { data, error });

    if (error) {
      // Si no existe la tabla o el registro, lo creamos
      if (error.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('mapbox_usage')
          .insert([{ count: 1 }]);
        
        if (insertError) throw insertError;
        return true;
      }
      throw error;
    }

    // Si ya alcanzamos el límite, retornamos false
    if (data.count >= MAPBOX_USAGE_LIMIT) {
      return false;
    }

    // Incrementar el contador
    const { error: updateError } = await supabase
      .from('mapbox_usage')
      .update({ count: data.count + 1 })
      .eq('id', data.id);

    if (updateError) throw updateError;
    return true;
  } catch (error) {
    console.error('Error checking Mapbox usage:', error);
    return false; // En caso de error, denegamos el acceso por seguridad
  }
}

export async function checkMapboxSearchUsage(): Promise<boolean> {
  try {
    // Obtener el contador de búsquedas
    const { data, error } = await supabase
      .from('mapbox_usage')
      .select('id, search_count')
      .single();

    console.log('Mapbox search usage check:', { data, error });

    if (error) {
      // Si no existe la tabla o el registro, lo creamos
      if (error.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('mapbox_usage')
          .insert([{ search_count: 1 }]);
        
        if (insertError) throw insertError;
        return true;
      }
      throw error;
    }

    // Si ya alcanzamos el límite, retornamos false
    if (data.search_count >= MAPBOX_SEARCH_LIMIT) {
      return false;
    }

    // Incrementar el contador de búsquedas
    const { error: updateError } = await supabase
      .from('mapbox_usage')
      .update({ search_count: data.search_count + 1 })
      .eq('id', data.id);

    if (updateError) throw updateError;
    return true;
  } catch (error) {
    console.error('Error checking Mapbox search usage:', error);
    return false; // En caso de error, denegamos el acceso por seguridad
  }
}

export async function getMapboxUsage(): Promise<{ mapLoads: number; searches: number }> {
  try {
    const { data, error } = await supabase
      .from('mapbox_usage')
      .select('count, search_count')
      .single();

    console.log('Getting Mapbox usage:', { data, error });

    if (error) return { mapLoads: 0, searches: 0 };
    return { 
      mapLoads: data.count || 0,
      searches: data.search_count || 0
    };
  } catch (error) {
    console.error('Error getting Mapbox usage:', error);
    return { mapLoads: 0, searches: 0 };
  }
} 