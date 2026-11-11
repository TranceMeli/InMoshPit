
from django.contrib import admin

from .models import Artist, Band, BandMember, Genre


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Artist)
class ArtistAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at")
    search_fields = ("name",)
    list_filter = ("genres",)
    prepopulated_fields = {"slug": ("name",)}



class BandMemberInline(admin.TabularInline):
    model = BandMember
    extra = 1


@admin.register(Band)
class BandAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at")
    search_fields = ("name",)
    list_filter = ("genres",)
    prepopulated_fields = {"slug": ("name",)}
    inlines = [BandMemberInline]
    search_fields = ("name",)


@admin.register(BandMember)
class BandMemberAdmin(admin.ModelAdmin):
    list_display = ("artist", "band", "role")
    list_filter = ("band",)
    search_fields = ("artist__name", "band__name")
