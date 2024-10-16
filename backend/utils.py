from sqlalchemy.inspection import inspect

def to_dict(self):
    """Convert an SQLAlchemy model instance into a dictionary."""
    return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}
