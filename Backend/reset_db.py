from database import get_db

def main():
    db = get_db()
    
    # Reset Boy1 and Boy2 duos
    res_duos = db.duos.delete_many({"members": {"$in": ["boy1@test.com", "boy2@test.com"]}})
    print(f"Deleted {res_duos.deleted_count} duo documents.")
    
    # Reset all duo invites
    res_invites = db.duo_invites.delete_many({})
    print(f"Deleted {res_invites.deleted_count} invite documents.")
    
    print("Database reset complete! Both boy1@test.com and boy2@test.com are now solo.")

if __name__ == '__main__':
    main()
