export class Helper{
    public static safeCheck<T>(obj: T | null, name: string): T {
        if (obj === null)
            throw `object $[name} cannot be null`;
    
        return obj;
    }
  
}
